import { useCallback, useState } from "react";

export default () => {
  const [svgRender, setSvgRender] = useState<boolean>(true);

  const handleCodeSourceClick = useCallback(() => {
    setSvgRender(false);
  }, []);

  const handleRenderClick = useCallback(() => {
    setSvgRender(true);
  }, []);

  return { handleCodeSourceClick, handleRenderClick, svgRender };
};
