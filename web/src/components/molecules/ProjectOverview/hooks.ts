import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { Project, UpdateProjectInput } from "../Workspace/types";

export default ({
  project,
  onProjectUpdate,
}: {
  project?: Project;
  onProjectUpdate: (data: UpdateProjectInput) => Promise<void>;
}) => {
  const [activeReadmeTab, setActiveReadmeTab] = useState("edit");
  const [readmeEditMode, setReadmeEditMode] = useState(false);
  const [readmeValue, setReadmeValue] = useState("");

  const [activeLicenseTab, setActiveLicenseTab] = useState("edit");
  const [licenseEditMode, setLicenseEditMode] = useState(false);
  const [licenseValue, setLicenseValue] = useState("");

  useEffect(() => {
    if (project?.readme) {
      setReadmeValue(project.readme);
    }
  }, [project?.readme]);

  useEffect(() => {
    if (project?.license) {
      setLicenseValue(project.license);
    }
  }, [project?.license]);

  const handleReadmeSave = useCallback(async () => {
    if (!project?.id) return;
    setActiveReadmeTab("edit");
    setReadmeEditMode(false);
    await onProjectUpdate({
      projectId: project.id,
      readme: readmeValue,
    });
  }, [onProjectUpdate, project?.id, readmeValue]);

  const handleReadmeEdit = useCallback(() => {
    setReadmeEditMode(true);
  }, []);

  const handleLicenseSave = useCallback(async () => {
    if (!project?.id) return;
    setActiveLicenseTab("edit");
    setLicenseEditMode(false);
    await onProjectUpdate({
      projectId: project.id,
      license: licenseValue,
    });
  }, [onProjectUpdate, project?.id, licenseValue]);

  const handleLicenseEdit = useCallback(() => {
    setLicenseEditMode(true);
  }, []);

  const handleReadmeMarkdownChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setReadmeValue(e.target.value);
  }, []);

  const handleLicenseMarkdownChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setLicenseValue(e.target.value);
  }, []);

  const handleChooseLicenseTemplate = useCallback((value: string) => {
    setLicenseValue(value);
  }, []);

  return {
    activeReadmeTab,
    setActiveReadmeTab,
    readmeEditMode,
    readmeValue,
    activeLicenseTab,
    setActiveLicenseTab,
    licenseEditMode,
    licenseValue,
    handleReadmeSave,
    handleReadmeEdit,
    handleLicenseSave,
    handleLicenseEdit,
    handleReadmeMarkdownChange,
    handleLicenseMarkdownChange,
    handleChooseLicenseTemplate,
  };
};
