import { useState } from "react";

export default (url: string) => {
  const [svgRender, setSvgRender] = useState<boolean>(true);

  const handleCodeSourceClick = () => {
    setSvgRender(false);
  };

  const handleRenderClick = () => {
    setSvgRender(true);
  };

  const [viewerUrl, setViewerUrl] = useState(url);

  return { svgRender, handleCodeSourceClick, handleRenderClick, viewerUrl, setViewerUrl };
};
