import { useParams } from "react-router-dom";

export default () => {
  const { keyId } = useParams();

  return {
    keyId,
  };
};
