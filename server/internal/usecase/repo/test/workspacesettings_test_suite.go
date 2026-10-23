package test

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type workspaceSettingsFactory = func(t *testing.T) repo.WorkspaceSettings

func TestWorkspaceSettingsRepo(t *testing.T, newRepo workspaceSettingsFactory) {
	t.Run("Filtered", func(t *testing.T) { testWorkspaceSettingsFiltered(t, newRepo) })
	t.Run("FindByID", func(t *testing.T) { testWorkspaceSettingsFindByID(t, newRepo) })
	t.Run("FindByIDs", func(t *testing.T) { testWorkspaceSettingsFindByIDs(t, newRepo) })
	t.Run("RoundTrip", func(t *testing.T) { testWorkspaceSettingsRoundTrip(t, newRepo) })
	t.Run("Isolation", func(t *testing.T) { testWorkspaceSettingsIsolation(t, newRepo) })
	t.Run("Save", func(t *testing.T) { testWorkspaceSettingsSave(t, newRepo) })
	t.Run("Remove", func(t *testing.T) { testWorkspaceSettingsRemove(t, newRepo) })
}

func newWorkspaceSettings(wid accountdomain.WorkspaceID, tiles, terrains *workspacesettings.ResourceList) *workspacesettings.WorkspaceSettings {
	return workspacesettings.New().ID(wid).Tiles(tiles).Terrains(terrains).MustBuild()
}

func newWorkspaceSettingsTile(tt workspacesettings.TileType, name string) *workspacesettings.Resource {
	props := workspacesettings.NewURLResourceProps(name, "https://tiles.example.com/"+name+"/{z}/{x}/{y}.png", "https://example.com/"+name+".png")
	tile := workspacesettings.NewTileResource(workspacesettings.NewResourceID(), tt, props)
	return workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tile, nil)
}

func newWorkspaceSettingsTerrain(tt workspacesettings.TerrainType, name string) *workspacesettings.Resource {
	props := workspacesettings.NewCesiumResourceProps(name, "https://terrain.example.com/"+name, "https://example.com/"+name+".png", "asset-"+name, "token-"+name)
	terrain := workspacesettings.NewTerrainResource(workspacesettings.NewResourceID(), tt, props)
	return workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil, terrain)
}

func newWorkspaceSettingsFull(wid accountdomain.WorkspaceID) *workspacesettings.WorkspaceSettings {
	tile := newWorkspaceSettingsTile(workspacesettings.TileTypeURL, "tile")
	terrain := newWorkspaceSettingsTerrain(workspacesettings.TerrainTypeCesiumIon, "terrain")
	return newWorkspaceSettings(wid,
		workspacesettings.NewResourceList([]*workspacesettings.Resource{tile}, new(tile.Tile().ID()), new(true)),
		workspacesettings.NewResourceList([]*workspacesettings.Resource{terrain}, new(terrain.Terrain().ID()), new(true)),
	)
}

func saveWorkspaceSettings(t *testing.T, r repo.WorkspaceSettings, seeds workspacesettings.List) {
	t.Helper()
	for _, ws := range seeds {
		require.NoError(t, r.Save(context.Background(), ws))
	}
}

func storedWorkspaceSettings(t *testing.T, r repo.WorkspaceSettings, ids accountdomain.WorkspaceIDList) workspacesettings.List {
	t.Helper()
	var res workspacesettings.List
	for _, wid := range ids {
		ws, err := r.FindByID(context.Background(), wid)
		if errors.Is(err, rerror.ErrNotFound) || errors.Is(err, repo.ErrOperationDenied) {
			continue
		}
		require.NoError(t, err)
		res = append(res, ws)
	}
	return res
}

func testWorkspaceSettingsFiltered(t *testing.T, newRepo workspaceSettingsFactory) {
	ctx := context.Background()
	w1, w2, w3 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1s := newWorkspaceSettingsFull(w1)
	w2s := newWorkspaceSettingsFull(w2)
	w3s := newWorkspaceSettingsFull(w3)
	seeds := workspacesettings.List{w1s, w2s, w3s}
	all := accountdomain.WorkspaceIDList{w1, w2, w3}

	tests := []struct {
		name      string
		filter    func(r repo.WorkspaceSettings) repo.WorkspaceSettings
		wantRead  workspacesettings.List
		wantWrite accountdomain.WorkspaceIDList // workspaces Save must accept
		wantDeny  accountdomain.WorkspaceIDList // workspaces Save must reject
	}{
		{
			name: "must merge readable workspaces of chained filters",
			filter: func(r repo.WorkspaceSettings) repo.WorkspaceSettings {
				return r.Filtered(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)).
					Filtered(wsFilter(accountdomain.WorkspaceIDList{w2}, nil))
			},
			wantRead: workspacesettings.List{w1s, w2s},
			wantDeny: all,
		},
		{
			name: "must merge writable workspaces of chained filters",
			filter: func(r repo.WorkspaceSettings) repo.WorkspaceSettings {
				return r.Filtered(wsFilter(accountdomain.WorkspaceIDList{w1}, accountdomain.WorkspaceIDList{w1})).
					Filtered(wsFilter(accountdomain.WorkspaceIDList{w2}, accountdomain.WorkspaceIDList{w2}))
			},
			wantRead:  workspacesettings.List{w1s, w2s},
			wantWrite: accountdomain.WorkspaceIDList{w1, w2},
			wantDeny:  accountdomain.WorkspaceIDList{w3},
		},
		{
			name: "must read writable-only workspaces",
			filter: func(r repo.WorkspaceSettings) repo.WorkspaceSettings {
				return r.Filtered(wsFilter(nil, accountdomain.WorkspaceIDList{w3}))
			},
			wantRead:  workspacesettings.List{w3s},
			wantWrite: accountdomain.WorkspaceIDList{w3},
			wantDeny:  accountdomain.WorkspaceIDList{w1, w2},
		},
		{
			name: "must keep restrictions when chained with an empty filter",
			filter: func(r repo.WorkspaceSettings) repo.WorkspaceSettings {
				return r.Filtered(wsFilter(accountdomain.WorkspaceIDList{w1}, accountdomain.WorkspaceIDList{w1})).
					Filtered(repo.WorkspaceFilter{})
			},
			wantRead:  workspacesettings.List{w1s},
			wantWrite: accountdomain.WorkspaceIDList{w1},
			wantDeny:  accountdomain.WorkspaceIDList{w2, w3},
		},
		{
			name: "must keep an unrestricted repository unrestricted with empty filters",
			filter: func(r repo.WorkspaceSettings) repo.WorkspaceSettings {
				return r.Filtered(repo.WorkspaceFilter{}).Filtered(repo.WorkspaceFilter{})
			},
			wantRead:  seeds,
			wantWrite: all,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			saveWorkspaceSettings(t, base, seeds)
			r := tc.filter(base)

			assert.Equal(t, tc.wantRead, storedWorkspaceSettings(t, r, all))
			for _, w := range tc.wantWrite {
				assert.NoError(t, r.Save(ctx, newWorkspaceSettings(w, nil, nil)))
			}
			for _, w := range tc.wantDeny {
				assert.Equal(t, repo.ErrOperationDenied, r.Save(ctx, newWorkspaceSettings(w, nil, nil)))
			}
		})
	}
}

func testWorkspaceSettingsFindByID(t *testing.T, newRepo workspaceSettingsFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1s := newWorkspaceSettingsFull(w1)
	w2s := newWorkspaceSettings(w2, nil, nil)
	seeds := workspacesettings.List{w1s, w2s}

	tests := []struct {
		name    string
		seeds   workspacesettings.List
		filter  *repo.WorkspaceFilter
		args    accountdomain.WorkspaceID
		want    *workspacesettings.WorkspaceSettings
		wantErr error
	}{
		{
			name:  "must find settings with tiles and terrains",
			seeds: seeds,
			args:  w1,
			want:  w1s,
		},
		{
			name:  "must find settings without tiles and terrains",
			seeds: seeds,
			args:  w2,
			want:  w2s,
		},
		{
			name:   "must find settings of a readable workspace",
			seeds:  seeds,
			filter: new(wsFilter(accountdomain.WorkspaceIDList{w2}, nil)),
			args:   w2,
			want:   w2s,
		},
		{
			// WorkspaceFilter.CanRead treats writable workspaces as readable
			name:   "must find settings of a writable-only workspace",
			seeds:  seeds,
			filter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:   w1,
			want:   w1s,
		},
		{
			name:    "must not find settings of an unknown workspace",
			seeds:   seeds,
			args:    accountdomain.NewWorkspaceID(),
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not find any settings in an empty repository",
			args:    w1,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must deny settings of an unreadable workspace",
			seeds:   seeds,
			filter:  new(wsFilter(accountdomain.WorkspaceIDList{w2}, accountdomain.WorkspaceIDList{w2})),
			args:    w1,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must deny an unknown unreadable workspace",
			seeds:   seeds,
			filter:  new(wsFilter(accountdomain.WorkspaceIDList{w2}, nil)),
			args:    accountdomain.NewWorkspaceID(),
			wantErr: repo.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			saveWorkspaceSettings(t, r, tc.seeds)
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByID(ctx, tc.args)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testWorkspaceSettingsFindByIDs(t *testing.T, newRepo workspaceSettingsFactory) {
	ctx := context.Background()
	w1, w2, w3 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1s := newWorkspaceSettingsFull(w1)
	w2s := newWorkspaceSettings(w2, nil, nil)
	w3s := newWorkspaceSettingsFull(w3)
	seeds := workspacesettings.List{w1s, w2s, w3s}
	unknown := accountdomain.NewWorkspaceID()

	tests := []struct {
		name    string
		seeds   workspacesettings.List
		filter  *repo.WorkspaceFilter
		args    accountdomain.WorkspaceIDList
		want    workspacesettings.List
		wantErr error
	}{
		{
			name:  "must find nothing for an empty list",
			seeds: seeds,
			args:  accountdomain.WorkspaceIDList{},
		},
		{
			name:  "must find nothing for a nil list",
			seeds: seeds,
		},
		{
			name:  "must find settings of several workspaces",
			seeds: seeds,
			args:  accountdomain.WorkspaceIDList{w1, w2, w3},
			want:  workspacesettings.List{w1s, w2s, w3s},
		},
		{
			name:  "must keep the order of the given IDs",
			seeds: seeds,
			args:  accountdomain.WorkspaceIDList{w3, w1, w2},
			want:  workspacesettings.List{w3s, w1s, w2s},
		},
		{
			name:  "must skip unknown workspaces",
			seeds: seeds,
			args:  accountdomain.WorkspaceIDList{unknown, w2, accountdomain.NewWorkspaceID(), w1},
			want:  workspacesettings.List{w2s, w1s},
		},
		{
			name:  "must return an empty list when no workspace is known",
			seeds: seeds,
			args:  accountdomain.WorkspaceIDList{unknown},
			want:  workspacesettings.List{},
		},
		{
			name: "must return an empty list from an empty repository",
			args: accountdomain.WorkspaceIDList{w1, w2},
			want: workspacesettings.List{},
		},
		{
			name:   "must find settings of readable workspaces",
			seeds:  seeds,
			filter: new(wsFilter(accountdomain.WorkspaceIDList{w1, w3}, nil)),
			args:   accountdomain.WorkspaceIDList{w3, w1},
			want:   workspacesettings.List{w3s, w1s},
		},
		{
			name:   "must find settings of writable-only workspaces",
			seeds:  seeds,
			filter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w2})),
			args:   accountdomain.WorkspaceIDList{w2},
			want:   workspacesettings.List{w2s},
		},
		{
			name:   "must find nothing for an empty list with a restricted filter",
			seeds:  seeds,
			filter: new(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)),
			args:   accountdomain.WorkspaceIDList{},
		},
		{
			name:    "must deny the whole call when any workspace is unreadable",
			seeds:   seeds,
			filter:  new(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)),
			args:    accountdomain.WorkspaceIDList{w1, w2},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must deny an unknown unreadable workspace",
			seeds:   seeds,
			filter:  new(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)),
			args:    accountdomain.WorkspaceIDList{unknown},
			wantErr: repo.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			saveWorkspaceSettings(t, r, tc.seeds)
			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByIDs(ctx, tc.args)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func testWorkspaceSettingsRoundTrip(t *testing.T, newRepo workspaceSettingsFactory) {
	ctx := context.Background()
	type rs = []*workspacesettings.Resource
	list := workspacesettings.NewResourceList
	tile := newWorkspaceSettingsTile
	terrain := newWorkspaceSettingsTerrain
	t1 := tile(workspacesettings.TileTypeDefault, "t1")
	t2 := tile(workspacesettings.TileTypeURL, "t2")
	tr1 := terrain(workspacesettings.TerrainTypeReearthTerrain, "tr1")
	tr2 := terrain(workspacesettings.TerrainTypeCesiumIon, "tr2")

	tests := []struct {
		name     string
		tiles    *workspacesettings.ResourceList
		terrains *workspacesettings.ResourceList
	}{
		{
			name: "must keep settings without tiles and terrains",
		},
		{
			name:     "must keep empty resource lists",
			tiles:    list(nil, nil, nil),
			terrains: list(nil, nil, nil),
		},
		{
			name:     "must keep resource lists with no resources",
			tiles:    list(rs{}, nil, nil),
			terrains: list(rs{}, nil, nil),
		},
		{
			name:  "must keep a default tile",
			tiles: list(rs{tile(workspacesettings.TileTypeDefault, "default")}, nil, nil),
		},
		{
			name:  "must keep a road map tile",
			tiles: list(rs{tile(workspacesettings.TileTypeRoadMap, "road")}, nil, nil),
		},
		{
			name:  "must keep an open street map tile",
			tiles: list(rs{tile(workspacesettings.TileTypeOpenStreetMap, "osm")}, nil, nil),
		},
		{
			name:  "must keep an earth at night tile",
			tiles: list(rs{tile(workspacesettings.TileTypeEarthAtNight, "night")}, nil, nil),
		},
		{
			name:  "must keep a japan GSI standard map tile",
			tiles: list(rs{tile(workspacesettings.TileTypeJapanGSIStandardMap, "gsi")}, nil, nil),
		},
		{
			name:  "must keep a URL tile",
			tiles: list(rs{tile(workspacesettings.TileTypeURL, "url")}, nil, nil),
		},
		{
			name:     "must keep a re:earth terrain",
			terrains: list(rs{terrain(workspacesettings.TerrainTypeReearthTerrain, "reearth")}, nil, nil),
		},
		{
			name:     "must keep a cesium ion terrain",
			terrains: list(rs{terrain(workspacesettings.TerrainTypeCesiumIon, "ion")}, nil, nil),
		},
		{
			name: "must keep resources with empty props",
			tiles: list(rs{workspacesettings.NewResource(workspacesettings.ResourceTypeTile,
				workspacesettings.NewTileResource(workspacesettings.NewResourceID(), workspacesettings.TileTypeURL, workspacesettings.UrlResourceProps{}), nil)}, nil, nil),
			terrains: list(rs{workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil,
				workspacesettings.NewTerrainResource(workspacesettings.NewResourceID(), workspacesettings.TerrainTypeCesiumIon, workspacesettings.CesiumResourceProps{}))}, nil, nil),
		},
		{
			name:     "must keep resources with multibyte props",
			tiles:    list(rs{tile(workspacesettings.TileTypeURL, "地図 🗺")}, nil, nil),
			terrains: list(rs{terrain(workspacesettings.TerrainTypeCesiumIon, "地形 ⛰")}, nil, nil),
		},
		{
			name:     "must keep the order of resources",
			tiles:    list(rs{t2, t1}, nil, nil),
			terrains: list(rs{tr2, tr1}, nil, nil),
		},
		{
			name:     "must keep enabled lists",
			tiles:    list(rs{t1}, nil, new(true)),
			terrains: list(rs{tr1}, nil, new(true)),
		},
		{
			name:     "must keep disabled lists",
			tiles:    list(rs{t1}, nil, new(false)),
			terrains: list(rs{tr1}, nil, new(false)),
		},
		{
			name:     "must keep selected resources",
			tiles:    list(rs{t1, t2}, new(t2.Tile().ID()), nil),
			terrains: list(rs{tr1, tr2}, new(tr2.Terrain().ID()), nil),
		},
		{
			name:     "must keep a selected resource that is not in the list",
			tiles:    list(nil, new(workspacesettings.NewResourceID()), nil),
			terrains: list(nil, new(workspacesettings.NewResourceID()), nil),
		},
		{
			name:  "must keep tiles without terrains",
			tiles: list(rs{t1}, new(t1.Tile().ID()), new(true)),
		},
		{
			name:     "must keep terrains without tiles",
			terrains: list(rs{tr1}, new(tr1.Terrain().ID()), new(false)),
		},
		{
			name:     "must keep every part of the settings",
			tiles:    list(rs{t1, t2}, new(t1.Tile().ID()), new(true)),
			terrains: list(rs{tr1, tr2}, new(tr2.Terrain().ID()), new(false)),
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			ws := newWorkspaceSettings(accountdomain.NewWorkspaceID(), tc.tiles, tc.terrains)
			require.NoError(t, r.Save(ctx, ws))

			got, err := r.FindByID(ctx, ws.ID())
			assert.NoError(t, err)
			assert.Equal(t, ws, got)
		})
	}
}

func testWorkspaceSettingsIsolation(t *testing.T, newRepo workspaceSettingsFactory) {
	ctx := context.Background()

	tests := []struct {
		name   string
		mutate func(saved, found *workspacesettings.WorkspaceSettings)
	}{
		{
			name:   "must not keep changes made to saved settings",
			mutate: func(saved, _ *workspacesettings.WorkspaceSettings) { saved.SetTiles(nil) },
		},
		{
			name:   "must not keep changes made to the resource list of saved settings",
			mutate: func(saved, _ *workspacesettings.WorkspaceSettings) { saved.Terrains().SetEnabled(new(false)) },
		},
		{
			name:   "must not keep changes made to found settings",
			mutate: func(_, found *workspacesettings.WorkspaceSettings) { found.SetTerrains(nil) },
		},
		{
			name: "must not keep changes made to the resource list of found settings",
			mutate: func(_, found *workspacesettings.WorkspaceSettings) {
				found.Tiles().SetResources(nil)
				found.Tiles().SetSelectedResource(nil)
			},
		},
		{
			name: "must not keep changes made to a resource of found settings",
			mutate: func(_, found *workspacesettings.WorkspaceSettings) {
				found.Tiles().Resources()[0].SetTile(nil)
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := newRepo(t)
			saved := newWorkspaceSettingsFull(accountdomain.NewWorkspaceID())
			want := saved.Clone()
			require.NoError(t, r.Save(ctx, saved))
			found, err := r.FindByID(ctx, saved.ID())
			require.NoError(t, err)
			assert.Equal(t, want, found)
			assert.NotSame(t, saved, found)

			tc.mutate(saved, found)

			got, err := r.FindByID(ctx, saved.ID())
			assert.NoError(t, err)
			assert.Equal(t, want, got)
		})
	}
}

func testWorkspaceSettingsSave(t *testing.T, newRepo workspaceSettingsFactory) {
	ctx := context.Background()
	w1 := accountdomain.NewWorkspaceID()
	w1s := newWorkspaceSettingsFull(w1)
	w1sUpdated := newWorkspaceSettings(w1,
		workspacesettings.NewResourceList([]*workspacesettings.Resource{newWorkspaceSettingsTile(workspacesettings.TileTypeOpenStreetMap, "osm")}, nil, new(false)),
		nil,
	)
	// the builder rejects invalid resources, so valid settings are broken with SetTiles
	withTiles := func(r *workspacesettings.Resource) *workspacesettings.WorkspaceSettings {
		ws := newWorkspaceSettings(w1, nil, nil)
		ws.SetTiles(workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, nil, nil))
		return ws
	}

	tests := []struct {
		name    string
		seeds   workspacesettings.List
		filter  *repo.WorkspaceFilter
		args    *workspacesettings.WorkspaceSettings
		want    *workspacesettings.WorkspaceSettings // the stored settings afterwards
		wantErr error
	}{
		{
			name: "must save new settings",
			args: w1s,
			want: w1s,
		},
		{
			name:  "must replace existing settings as a whole",
			seeds: workspacesettings.List{w1s},
			args:  w1sUpdated,
			want:  w1sUpdated,
		},
		{
			name:   "must save settings of a writable workspace",
			filter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:   w1s,
			want:   w1s,
		},
		{
			name:    "must not save settings of a readable-only workspace",
			filter:  new(wsFilter(accountdomain.WorkspaceIDList{w1}, nil)),
			args:    w1s,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not overwrite settings outside writable workspaces",
			seeds:   workspacesettings.List{w1s},
			filter:  new(wsFilter(nil, accountdomain.WorkspaceIDList{accountdomain.NewWorkspaceID()})),
			args:    w1sUpdated,
			want:    w1s, // unchanged
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must not save nil settings",
			wantErr: rerror.ErrInvalidParams,
		},
		{
			name:    "must not save a nil resource",
			seeds:   workspacesettings.List{w1s},
			args:    withTiles(nil),
			want:    w1s, // unchanged
			wantErr: workspacesettings.ErrInvalidResource,
		},
		{
			name:    "must not save a tile of an unknown type",
			seeds:   workspacesettings.List{w1s},
			args:    withTiles(newWorkspaceSettingsTile("unknown", "unknown")),
			want:    w1s, // unchanged
			wantErr: workspacesettings.ErrInvalidResource,
		},
		{
			name:    "must not save a terrain in the tiles",
			seeds:   workspacesettings.List{w1s},
			args:    withTiles(newWorkspaceSettingsTerrain(workspacesettings.TerrainTypeCesiumIon, "terrain")),
			want:    w1s, // unchanged
			wantErr: workspacesettings.ErrInvalidResource,
		},
		{
			name:    "must not save a terrain of an empty type",
			seeds:   workspacesettings.List{w1s},
			args:    withTiles(newWorkspaceSettingsTerrain("", "empty")),
			want:    w1s, // unchanged
			wantErr: workspacesettings.ErrInvalidResource,
		},
		{
			name:  "must not save a resource with a zero ID",
			seeds: workspacesettings.List{w1s},
			args: withTiles(workspacesettings.NewResource(workspacesettings.ResourceTypeTile,
				workspacesettings.NewTileResource(workspacesettings.ResourceID{}, workspacesettings.TileTypeURL, workspacesettings.UrlResourceProps{}), nil)),
			want:    w1s, // unchanged
			wantErr: workspacesettings.ErrInvalidResource,
		},
		{
			name:    "must not save a resource without a tile or a terrain",
			seeds:   workspacesettings.List{w1s},
			args:    withTiles(workspacesettings.NewResource(workspacesettings.ResourceTypeTile, nil, nil)),
			want:    w1s, // unchanged
			wantErr: workspacesettings.ErrInvalidResource,
		},
		{
			name:  "must not save a resource with both a tile and a terrain",
			seeds: workspacesettings.List{w1s},
			args: withTiles(workspacesettings.NewResource(workspacesettings.ResourceTypeTile,
				newWorkspaceSettingsTile(workspacesettings.TileTypeURL, "tile").Tile(),
				newWorkspaceSettingsTerrain(workspacesettings.TerrainTypeCesiumIon, "terrain").Terrain())),
			want:    w1s, // unchanged
			wantErr: workspacesettings.ErrInvalidResource,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			saveWorkspaceSettings(t, base, tc.seeds)
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.Equal(t, tc.wantErr, r.Save(ctx, tc.args))
			if tc.args == nil {
				return
			}

			// the stored state is checked unfiltered
			got, err := base.FindByID(ctx, tc.args.ID())
			assert.Equal(t, tc.want, got)
			if tc.want == nil {
				assert.Equal(t, rerror.ErrNotFound, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func testWorkspaceSettingsRemove(t *testing.T, newRepo workspaceSettingsFactory) {
	ctx := context.Background()
	w1, w2 := accountdomain.NewWorkspaceID(), accountdomain.NewWorkspaceID()
	w1s := newWorkspaceSettingsFull(w1)
	w2s := newWorkspaceSettings(w2, nil, nil)
	seeds := workspacesettings.List{w1s, w2s}
	all := accountdomain.WorkspaceIDList{w1, w2}

	tests := []struct {
		name    string
		seeds   workspacesettings.List
		filter  *repo.WorkspaceFilter
		args    accountdomain.WorkspaceID
		want    workspacesettings.List // settings that must remain after the call
		wantErr error
	}{
		{
			name:  "must remove settings",
			seeds: seeds,
			args:  w1,
			want:  workspacesettings.List{w2s},
		},
		{
			name:    "must not remove settings of an unknown workspace",
			seeds:   seeds,
			args:    accountdomain.NewWorkspaceID(),
			want:    seeds,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "must not remove anything from an empty repository",
			args:    w1,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:   "must remove settings of a writable workspace",
			seeds:  seeds,
			filter: new(wsFilter(nil, accountdomain.WorkspaceIDList{w2})),
			args:   w2,
			want:   workspacesettings.List{w1s},
		},
		{
			name:    "must not remove settings of a readable-only workspace",
			seeds:   seeds,
			filter:  new(wsFilter(accountdomain.WorkspaceIDList{w1, w2}, nil)),
			args:    w1,
			want:    seeds,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "must deny removing an unknown workspace outside writable workspaces",
			seeds:   seeds,
			filter:  new(wsFilter(nil, accountdomain.WorkspaceIDList{w1})),
			args:    accountdomain.NewWorkspaceID(),
			want:    seeds,
			wantErr: repo.ErrOperationDenied,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			base := newRepo(t)
			saveWorkspaceSettings(t, base, tc.seeds)
			r := base
			if tc.filter != nil {
				r = base.Filtered(*tc.filter)
			}

			assert.Equal(t, tc.wantErr, r.Remove(ctx, tc.args))

			// remaining settings are checked unfiltered to prove they truly
			// survived (and were not just hidden by the filter)
			assert.Equal(t, tc.want, storedWorkspaceSettings(t, base, all))
		})
	}
}
