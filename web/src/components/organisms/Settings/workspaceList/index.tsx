import useHooks from "../Workspace/hooks";

// Components

type Props = {
  workspaceId: string;
};

const WorkspaceList: React.FC<Props> = ({ workspaceId }) => {
  const {
    workspaces,
    // currentWorkspace,
    // createWorkspace,
    // selectWorkspace,
    // loading,
  } = useHooks({ workspaceId });

  return (
    <>
      <h1>
        {workspaces?.map((workspace) => {
          return <h2 key={workspace.id}> {workspace.name}</h2>;
        })}
      </h1>
    </>
  );
};

export default WorkspaceList;
