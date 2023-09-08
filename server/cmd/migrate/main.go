package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	mongodoc2 "github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmongo/mongodoc"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

type subject string
type cmsUserID string
type accountUserID string
type cmsWorkspaceID string
type accountWorkspaceID string

const (
	reearthAccount = "reearth-account"
	reearthCMS     = "reearth_cms"
)

func run() error {
	dry := flag.Bool("dry", false, "dry run")
	flag.Parse()

	ctx := context.Background()
	dbURI := os.Getenv("DB_URI")
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dbURI))
	if err != nil {
		return fmt.Errorf("connect: %w", err)
	}

	// subject => account user_id
	accountUserMap := map[subject]accountUserID{}
	// account user_id = account personal ws_id
	personalAccountWorkspaces := map[accountUserID]accountWorkspaceID{}

	// reearth-account 側の全ユーザーから subject とユーザーIDの紐づけ, 個人ワークスペースの紐づけを作る
	{
		accountUsers, err := allUsers(ctx, client, reearthAccount)
		if err != nil {
			return fmt.Errorf("reearth-account all accountUsers: %w", err)
		}
		for _, u := range accountUsers {
			auID, awsID, subs := fromAccountUser(u)
			for _, s := range subs {
				accountUserMap[s] = auID
			}
			personalAccountWorkspaces[auID] = awsID
		}
	}

	// cms ws_id => account ws_id
	migratedWorkspace := map[cmsWorkspaceID]accountWorkspaceID{}
	// cms user_id => account user_id
	migratedUser := map[cmsUserID]accountUserID{}

	// reearth_cms 側の全ユーザーから reearth-account に subject が存在しないユーザーを抽出する
	// subject が同一のユーザーが存在した場合 reearth-account 側のユーザに統合する
	var userWrites []mongo.WriteModel
	{
		cmsUsers, err := allUsers(ctx, client, reearthCMS)
		if err != nil {
			return fmt.Errorf("reearth_cms all accountUsers: %w", err)
		}
		for _, u := range cmsUsers {
			cuID, cwsID, subs := fromCMSUser(u)
			var migrated []subject
			for _, s := range subs {
				if _, ok := accountUserMap[s]; ok {
					migrated = append(migrated, s)
				}
			}
			if len(migrated) == len(subs) {
				// すべての subject が reearth-account に存在する場合は reearth-account 側の個人ワークスペースを cms 側の個人ワークスペースとする
				// cms 側の個人ワークスペースに関する参照を書き換える必要が生じる
				auID := accountUserMap[subs[0]]
				awsID := personalAccountWorkspaces[auID]
				migratedUser[cuID] = auID
				migratedWorkspace[cwsID] = awsID
				log.Printf("%s: u:%v -> u:%v", u.Name, cuID, auID)
				log.Printf("%s: ws:%v -> ws:%v", u.Name, cwsID, awsID)
			} else if len(migrated) > 0 {
				// subject に紐づく account user_id があるが欠損している sub があるので subs を追加する必要がある
				panic("unreachable")
			} else {
				// すべての subject に紐づく account user_id がない場合は新規に挿入する
				log.Printf("%s: insert u:%s %v", u.Name, cuID, subs)
				log.Printf("%s: insert ws:%s", u.Name, cwsID)

				migratedUser[cuID] = accountUserID(cuID)
				migratedWorkspace[cwsID] = accountWorkspaceID(cwsID)

				userWrites = append(userWrites, mongo.NewInsertOneModel().SetDocument(u))
			}
		}
	}

	// reearth-account へのユーザー統合に伴う統合が必要な個人ワークスペースの抽出を行う
	// 個人ワークスペース以外はそのまま reearth-account に追加する
	// すべてのワークスペースはユーザーへの参照を保持しているので書き換える必要がある
	var wsWrites []mongo.WriteModel
	{
		cmsWSs, err := allWorkspaces(ctx, client, reearthCMS)
		if err != nil {
			return fmt.Errorf("reearth_cms all workspaces: %w", err)
		}
		for _, ws := range cmsWSs {
			cwsID, cmsMembers := fromCMSWorkspace(ws)
			members := map[string]mongodoc.WorkspaceMemberDocument{}
			for cuID, v := range cmsMembers {
				auID := migratedUser[cuID]
				if !isSameUserID(auID, cuID) {
					log.Printf("%s: member u:%s -> u:%s", ws.Name, cuID, auID)
				}
				members[string(auID)] = v
			}

			if awsID, ok := migratedWorkspace[cwsID]; ok {
				// TODO: reearth_cms 側の個人ワークスペースと reearth-account 側の個人ワークスペースのメンバーが異なる場合どうするか？
				wsWrites = append(wsWrites, mongo.NewUpdateOneModel().
					SetFilter(bson.M{"id": awsID}).
					SetUpdate(bson.M{"$set": bson.M{"members": members}}),
				)
			} else { // 個人ワークスペース以外の場合 reearth-account 側に追加する必要がある
				migratedWorkspace[cwsID] = accountWorkspaceID(cwsID)
				log.Printf("%s: insert ws:%s", ws.Name, cwsID)
				aws := *ws
				aws.Members = members
				wsWrites = append(wsWrites, mongo.NewInsertOneModel().SetDocument(aws))
			}
		}
	}

	// ワークスペースの統合に伴って reearth_cms 側でワークスペースを参照しているプロジェクトを書き換える
	var projectWrites []mongo.WriteModel
	{
		ps, err := allProjects(ctx, client)
		if err != nil {
			return fmt.Errorf("reearth_cms all projects: %w", err)
		}

		for _, p := range ps {
			cwsID := cmsWorkspaceID(p.Workspace)
			awsID := migratedWorkspace[cwsID]
			if isSameWorkspaceID(awsID, cwsID) {
				continue
			}
			// reearth-account 側に統合したワークスペースの場合は ID が変わっているので project からの参照を書き換える必要がある
			log.Printf("%s: workspace ws:%s -> ws:%s", p.Name, cwsID, awsID)
			projectWrites = append(projectWrites, mongo.NewUpdateOneModel().
				SetFilter(bson.M{"id": p.ID}).
				SetUpdate(bson.M{"$set": bson.M{"workspace": awsID}}),
			)
		}
	}
	if !*dry {
		if _, err := client.Database(reearthAccount).Collection("user").BulkWrite(ctx, userWrites); err != nil {
			return fmt.Errorf("write user: %w", err)
		}
		if _, err := client.Database(reearthAccount).Collection("workspace").BulkWrite(ctx, wsWrites); err != nil {
			return fmt.Errorf("write workspace: %w", err)
		}
		// プロジェクトだけ reearth_cms 側の更新が必要になる
		if _, err := client.Database(reearthCMS).Collection("project").BulkWrite(ctx, projectWrites); err != nil {
			return fmt.Errorf("write project: %w", err)
		}
	}

	return nil
}

func fromAccountUser(u *mongodoc.UserDocument) (accountUserID, accountWorkspaceID, []subject) {
	return accountUserID(u.ID), accountWorkspaceID(u.Workspace), toSubs(u.Subs)
}

func fromCMSUser(u *mongodoc.UserDocument) (cmsUserID, cmsWorkspaceID, []subject) {
	return cmsUserID(u.ID), cmsWorkspaceID(u.Workspace), toSubs(u.Subs)
}

func fromCMSWorkspace(ws *mongodoc.WorkspaceDocument) (cmsWorkspaceID, map[cmsUserID]mongodoc.WorkspaceMemberDocument) {
	members := map[cmsUserID]mongodoc.WorkspaceMemberDocument{}
	for k, v := range ws.Members {
		members[cmsUserID(k)] = v
	}
	return cmsWorkspaceID(ws.ID), members
}

func allUsers(ctx context.Context, c *mongo.Client, db string) ([]*mongodoc.UserDocument, error) {
	cur, err := c.Database(db).Collection("user").Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("find: %w", err)
	}
	var users []*mongodoc.UserDocument
	if err := cur.All(ctx, &users); err != nil {
		return nil, fmt.Errorf("all: %w", err)
	}
	return users, nil
}

func allWorkspaces(ctx context.Context, c *mongo.Client, db string) ([]*mongodoc.WorkspaceDocument, error) {
	cur, err := c.Database(db).Collection("workspace").Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("find: %w", err)
	}
	var ws []*mongodoc.WorkspaceDocument
	if err := cur.All(ctx, &ws); err != nil {
		return nil, fmt.Errorf("all: %w", err)
	}
	return ws, nil
}

func allProjects(ctx context.Context, c *mongo.Client) ([]*mongodoc2.ProjectDocument, error) {
	cur, err := c.Database(reearthCMS).Collection("project").Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("find: %w", err)
	}
	var ps []*mongodoc2.ProjectDocument
	if err := cur.All(ctx, &ps); err != nil {
		return nil, fmt.Errorf("all: %w", err)
	}
	return ps, nil
}

func toSubs(ss []string) []subject {
	var subs []subject
	for _, s := range ss {
		subs = append(subs, subject(s))
	}
	return subs
}

func isSameUserID(a accountUserID, c cmsUserID) bool {
	return string(a) == string(c)
}

func isSameWorkspaceID(a accountWorkspaceID, c cmsWorkspaceID) bool {
	return string(a) == string(c)
}
