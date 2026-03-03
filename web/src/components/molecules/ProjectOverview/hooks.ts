import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { Project, UpdateProjectInput } from "../Workspace/types";

export default ({
  onProjectUpdate,
  project,
}: {
  onProjectUpdate: (data: UpdateProjectInput) => Promise<void>;
  project?: Project;
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
      license: licenseValue,
      projectId: project.id,
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
    activeLicenseTab,
    activeReadmeTab,
    handleChooseLicenseTemplate,
    handleLicenseEdit,
    handleLicenseMarkdownChange,
    handleLicenseSave,
    handleReadmeEdit,
    handleReadmeMarkdownChange,
    handleReadmeSave,
    licenseEditMode,
    licenseValue,
    readmeEditMode,
    readmeValue,
    setActiveLicenseTab,
    setActiveReadmeTab,
  };
};
