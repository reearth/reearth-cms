import { Cartesian3, Matrix4, Model, Viewer } from "cesium";
import { useCallback, useEffect, useRef } from "react";
import { useCesium } from "resium";

type Props = {
  url: string;
};

export const Imagery: React.FC<Props> = ({ url }) => {
  const { viewer } = useCesium() as { viewer: Viewer | undefined };
  const modelRef = useRef<Model | undefined>();

  const loadModel = useCallback(async () => {
    if (!viewer || !url.endsWith(".gltf")) return;

    const model = await Model.fromGltf({
      url,
      modelMatrix: Matrix4.fromTranslation(Cartesian3.ZERO),
      scene: viewer.scene,
      scale: 1000000,
    });

    modelRef.current = model;
    viewer.scene.globe.show = false;
    viewer.scene.primitives.add(model);
  }, [url, viewer]);

  const unloadModel = useCallback(() => {
    if (!viewer || !modelRef.current) return;

    viewer.scene.primitives.remove(modelRef.current);
    modelRef.current = undefined;
  }, [viewer]);

  useEffect(() => {
    loadModel();

    // return () => {
    //   unloadModel();
    // };
  }, [loadModel, unloadModel]);

  return null;
};
