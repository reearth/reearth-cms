import Typography from "@reearth-cms/components/atoms/Typography";

export type Props = {
  path?: string;
};

const RootPage: React.FC<Props> = () => {
  const { Title } = Typography;
  return <Title>CMS root page</Title>;
};

export default RootPage;
