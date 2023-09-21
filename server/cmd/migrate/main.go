package main

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

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
	reearth        = "reearth"
	reearthAccount = "reearth-account"
	reearthCMS     = "reearth_cms"
)

func rewriteTeam(ctx context.Context, client *mongo.Client, from, to string) error {
	if _, err := client.Database(reearth).Collection("project").UpdateMany(ctx, bson.M{"team": from}, bson.M{"$set": bson.M{"team": to}}); err != nil {
		return err
	}
	if _, err := client.Database(reearth).Collection("scene").UpdateMany(ctx, bson.M{"team": from}, bson.M{"$set": bson.M{"team": to}}); err != nil {
		return err
	}
	return nil
}

func run() error {
	log.SetOutput(os.Stdout)
	dry := flag.Bool("dry", false, "dry run")
	flag.Parse()

	ctx := context.Background()

	databaseURI := os.Getenv("DB_URI")
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(databaseURI))
	if err != nil {
		return fmt.Errorf("connect: %w", err)
	}

	if false {
		if err := restoreProjects(ctx, client); err != nil {
			return fmt.Errorf("restore p: %w", err)
		}
		if err := restoreIntegrations(ctx, client); err != nil {
			return fmt.Errorf("restore i: %w", err)
		}
		return nil
	}

	if false {
		if err := client.Database(reearthAccount).Drop(ctx); err != nil {
			return fmt.Errorf("drop reearth-account: %w", err)
		}
	}

	var migrateUserWrites []mongo.WriteModel
	{
		users, err := allUsers(ctx, client, reearth)
		if err != nil {
			return fmt.Errorf("reearth all users: %w", err)
		}
		for _, u := range users {
			migrateUserWrites = append(migrateUserWrites, mongo.NewInsertOneModel().SetDocument(u))
		}
	}
	var migrateWorkspaceWrites []mongo.WriteModel
	{
		ws, err := allWorkspaces(ctx, client, reearth, "team")
		if err != nil {
			return fmt.Errorf("reearth all teams: %w", err)
		}
		for _, w := range ws {
			migrateWorkspaceWrites = append(migrateWorkspaceWrites, mongo.NewInsertOneModel().SetDocument(w))
		}
	}
	if !*dry {
		if len(migrateUserWrites) > 0 {
			if _, err := client.Database(reearthAccount).Collection("user").BulkWrite(ctx, migrateUserWrites); err != nil {
				return fmt.Errorf("write users: %w", err)
			}
		}
		if len(migrateWorkspaceWrites) > 0 {
			if _, err := client.Database(reearthAccount).Collection("workspace").BulkWrite(ctx, migrateWorkspaceWrites); err != nil {
				return fmt.Errorf("write workspaces: %w", err)
			}
		}
	}
	return nil

	cmsDatabaseURI := os.Getenv("CMS_DB_URI")
	cmsClient, err := mongo.Connect(ctx, options.Client().ApplyURI(cmsDatabaseURI))
	if err != nil {
		return fmt.Errorf("connect cms: %w", err)
	}

	// subject => account user_id
	accountUserMap := map[subject]accountUserID{}
	// account user_id = account personal ws_id
	personalAccountWorkspaces := map[accountUserID]accountWorkspaceID{}

	emails := map[string]bool{}
	// reearth-account 側の全ユーザーから subject とユーザーIDの紐づけ, 個人ワークスペースの紐づけを作る
	{
		accountUsers, err := allUsers(ctx, cmsClient, reearthAccount)
		if err != nil {
			return fmt.Errorf("reearth-account all accountUsers: %w", err)
		}
		for _, u := range accountUsers {
			auID, awsID, subs := fromAccountUser(u)
			for _, s := range subs {
				accountUserMap[s] = auID
			}
			emails[u.Email] = true
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
	if false {
		cmsUsers, err := allUsers(ctx, cmsClient, reearthCMS)
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
				log.Printf("%s: ws:%v -> ws:%v personal", u.Name, cwsID, awsID)
			} else if len(migrated) > 0 {
				// subject に紐づく account user_id があるが欠損している sub があるので subs を追加する必要がある
				diff := []subject{}
				ss := map[subject]bool{}
				for _, sub := range migrated {
					ss[sub] = true
				}
				for _, s := range subs {
					if !ss[s] {
						diff = append(diff, s)
					}
				}
				log.Printf("WARN: reearth-cms-only user: %s: u:%s %+v", u.Name, cuID, diff)
			} else {
				// すべての subject に紐づく account user_id がない場合は新規に挿入する
				log.Printf("%s: insert u:%s %v", u.Name, cuID, subs)
				log.Printf("%s: insert ws:%s personal", u.Name, cwsID)

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
	if false {
		cmsWSs, err := allWorkspaces(ctx, cmsClient, reearthCMS, "workspace")
		if err != nil {
			return fmt.Errorf("reearth_cms all workspaces: %w", err)
		}
		for _, ws := range cmsWSs {
			cwsID, cmsMembers, cmsIntegrations := fromCMSWorkspace(ws)
			members := map[string]mongodoc.WorkspaceMemberDocument{}
			for cuID, v := range cmsMembers {
				auID, ok := migratedUser[cuID]
				if !ok {
					log.Printf("WARN: member not found: ws:%s u:%s", cwsID, cuID)
					continue
				}
				if !isSameUserID(auID, cuID) {
					log.Printf("%s: member u:%s -> u:%s", ws.Name, cuID, auID)
				}
				invitedBy := cmsUserID(v.InvitedBy)
				if migrated := migratedUser[invitedBy]; !isSameUserID(migrated, invitedBy) {
					v.InvitedBy = string(migrated)
				}
				members[string(auID)] = v
			}
			// メンバーが 0 なら作らない
			integrations := map[string]mongodoc.WorkspaceMemberDocument{}
			for id, v := range cmsIntegrations {
				invitedBy := cmsUserID(v.InvitedBy)
				if migrated := migratedUser[invitedBy]; !isSameUserID(migrated, invitedBy) {
					v.InvitedBy = string(migrated)
				}
				integrations[id] = v
			}

			if awsID, ok := migratedWorkspace[cwsID]; ok {
				if isSameWorkspaceID(awsID, cwsID) {
					log.Printf("%s: insert ws:%s", ws.Name, cwsID)
					aws := *ws
					aws.Members = members
					aws.Integrations = integrations
					wsWrites = append(wsWrites, mongo.NewInsertOneModel().SetDocument(aws))
				} else {
					wsWrites = append(wsWrites, mongo.NewUpdateOneModel().
						SetFilter(bson.M{"id": awsID}).
						SetUpdate(bson.M{"$set": bson.M{"members": members, "integrations": integrations}}),
					)
				}
			} else { // 個人ワークスペース以外の場合 reearth-account 側に追加する必要がある
				migratedWorkspace[cwsID] = accountWorkspaceID(cwsID)
				log.Printf("%s: insert ws:%s", ws.Name, cwsID)
				aws := *ws
				aws.Members = members
				aws.Integrations = integrations
				wsWrites = append(wsWrites, mongo.NewInsertOneModel().SetDocument(aws))
			}
		}
	}

	// ワークスペースの統合に伴って reearth_cms 側でワークスペースを参照しているプロジェクトを書き換える
	var projectWrites []mongo.WriteModel
	{
		ps, err := allProjects(ctx, cmsClient)
		if err != nil {
			return fmt.Errorf("reearth_cms all projects: %w", err)
		}

		for _, p := range ps {
			log.Printf("PROJECT: id:%s ws:%s", p.ID, p.Workspace)
			cwsID := cmsWorkspaceID(p.Workspace)
			awsID := migratedWorkspace[cwsID]
			if isSameWorkspaceID(awsID, cwsID) {
				log.Printf("DEBUG:: %s: p:%s ws:%s -> ws:%s same", p.Name, p.ID, p.Workspace, awsID)
				continue
			}
			if awsID == "" {
				log.Printf("WARN: MISSING WORKSPACE p:%s ws:%s", p.ID, cwsID)
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
	var integrationWrites []mongo.WriteModel
	{
		is, err := allIntegrations(ctx, cmsClient)
		if err != nil {
			return fmt.Errorf("reearth_cms all integrations: %w", err)
		}
		for _, i := range is {
			log.Printf("INTEGRATION: id:%s u:%s", i.ID, i.Developer)
			cuID := cmsUserID(i.Developer)
			auID := migratedUser[cuID]
			if isSameUserID(auID, cuID) {
				continue
			}
			if auID == "" {
				log.Printf("WARN: MISSING USER i:%s u:%s", i.ID, cuID)
				continue
			}
			log.Printf("%s: developer u:%s -> u:%s", i.Name, cuID, auID)
			integrationWrites = append(integrationWrites, mongo.NewUpdateOneModel().
				SetFilter(bson.M{"id": i.ID}).
				SetUpdate(bson.M{"$set": bson.M{"developer": auID}}),
			)
		}
	}

	if !*dry {
		if len(userWrites) > 0 {
			if _, err := cmsClient.Database(reearthAccount).Collection("user").BulkWrite(ctx, userWrites); err != nil {
				return fmt.Errorf("write user: %w", err)
			}
		}
		if len(wsWrites) > 0 {
			if _, err := cmsClient.Database(reearthAccount).Collection("workspace").BulkWrite(ctx, wsWrites); err != nil {
				return fmt.Errorf("write workspace: %w", err)
			}
		}
		if false && len(projectWrites) > 0 {
			// プロジェクトだけ reearth_cms 側の更新が必要になる
			if _, err := cmsClient.Database(reearthCMS).Collection("project").BulkWrite(ctx, projectWrites); err != nil {
				return fmt.Errorf("write project: %w", err)
			}
		}
		if false && len(integrationWrites) > 0 {
			if _, err := cmsClient.Database(reearthCMS).Collection("integration").BulkWrite(ctx, integrationWrites); err != nil {
				return fmt.Errorf("write integration: %w", err)
			}
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

func fromCMSWorkspace(ws *mongodoc.WorkspaceDocument) (cmsWorkspaceID, map[cmsUserID]mongodoc.WorkspaceMemberDocument, map[string]mongodoc.WorkspaceMemberDocument) {
	members := map[cmsUserID]mongodoc.WorkspaceMemberDocument{}
	for k, v := range ws.Members {
		members[cmsUserID(k)] = v
	}
	integrations := map[string]mongodoc.WorkspaceMemberDocument{}
	for k, v := range ws.Integrations {
		integrations[k] = v
	}
	return cmsWorkspaceID(ws.ID), members, integrations
}

type UserDocument struct {
	ID            string
	Name          string
	Email         string
	Auth0Sublist  []string
	Subs          []string
	Workspace     string
	Team          string
	Lang          string
	Theme         string
	Password      []byte
	PasswordReset *mongodoc.PasswordResetDocument
	Verification  *mongodoc.UserVerificationDoc
}

func allUsers(ctx context.Context, c *mongo.Client, db string) ([]*mongodoc.UserDocument, error) {
	cur, err := c.Database(db).Collection("user").Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("find: %w", err)
	}
	var users []UserDocument
	if err := cur.All(ctx, &users); err != nil {
		return nil, fmt.Errorf("all: %w", err)
	}
	var newUsers []*mongodoc.UserDocument
	for _, u := range users {
		subs := u.Subs
		if len(subs) == 0 {
			subs = u.Auth0Sublist
		}
		if u.Team != "" {
			u.Workspace = u.Team
			u.Team = ""
		}
		newUsers = append(newUsers, &mongodoc.UserDocument{
			ID:            u.ID,
			Name:          u.Name,
			Email:         u.Email,
			Subs:          subs,
			Workspace:     u.Workspace,
			Team:          u.Team,
			Lang:          u.Lang,
			Theme:         u.Theme,
			Password:      u.Password,
			PasswordReset: u.PasswordReset,
			Verification:  u.Verification,
		})
	}
	return newUsers, nil
}

func allWorkspaces(ctx context.Context, c *mongo.Client, db string, name string) ([]*mongodoc.WorkspaceDocument, error) {
	cur, err := c.Database(db).Collection(name).Find(ctx, bson.M{})
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

func allIntegrations(ctx context.Context, c *mongo.Client) ([]*mongodoc2.IntegrationDocument, error) {
	cur, err := c.Database(reearthCMS).Collection("integration").Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("find: %w", err)
	}
	var ps []*mongodoc2.IntegrationDocument
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

func restoreProjects(ctx context.Context, client *mongo.Client) error {
	f, err := os.Open("projects.txt")
	if err != nil {
		return fmt.Errorf("projects.txt: %w", err)
	}
	defer f.Close()

	s := bufio.NewScanner(f)
	var writes []mongo.WriteModel
	for s.Scan() {
		ts := strings.Split(s.Text(), " ")
		id := strings.TrimPrefix(ts[3], "id:")
		ws := strings.TrimPrefix(ts[4], "ws:")
		writes = append(writes, mongo.NewUpdateOneModel().SetFilter(bson.M{"id": id}).SetUpdate(bson.M{"$set": bson.M{"workspace": ws}}))
	}
	if _, err := client.Database(reearthCMS).Collection("project").BulkWrite(ctx, writes); err != nil {
		return fmt.Errorf("write project: %w", err)
	}
	return nil
}

func restoreIntegrations(ctx context.Context, client *mongo.Client) error {
	f, err := os.Open("integrations.txt")
	if err != nil {
		return fmt.Errorf("integrations.txt: %w", err)
	}
	defer f.Close()

	s := bufio.NewScanner(f)
	var writes []mongo.WriteModel
	for s.Scan() {
		ts := strings.Split(s.Text(), " ")
		id := strings.TrimPrefix(ts[3], "id:")
		u := strings.TrimPrefix(ts[4], "u:")
		writes = append(writes, mongo.NewUpdateOneModel().SetFilter(bson.M{"id": id}).SetUpdate(bson.M{"$set": bson.M{"developer": u}}))
	}
	if _, err := client.Database(reearthCMS).Collection("integration").BulkWrite(ctx, writes); err != nil {
		return fmt.Errorf("write integration: %w", err)
	}
	return nil
}
