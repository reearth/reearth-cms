export function getId() {
  return Math.ceil(Math.random() * (100000 - 10000) + 10000).toString();
}

/**
 * Generate Specific Length Array with Number
 * @function generateArray
 * @param {number} arrayLength
 * @returns {string[]}
 */
export function generateArray(arrayLength: number): string[] {
  return Array.from(Array(arrayLength).fill(""));
}

export function getMultipleProjects() {
  const A_CHAR_CODE = "a".charCodeAt(0);
  const PAGE_SIZE = 10;
  const NAME_SEPARATOR = "--";
  const PROJECT_ID_LIST = generateArray(15).map(
    (_, index) => String.fromCharCode(A_CHAR_CODE + index) + NAME_SEPARATOR + getId(),
  );
  const FIRST_PAGE_PROJECTS = PROJECT_ID_LIST.slice(PROJECT_ID_LIST.length - PAGE_SIZE);
  const SECOND_PAGE_PROJECTS = PROJECT_ID_LIST.slice(0, PROJECT_ID_LIST.length - PAGE_SIZE);

  return {
    PROJECT_ID_LIST,
    FIRST_PAGE_PROJECTS,
    SECOND_PAGE_PROJECTS,
    NAME_SEPARATOR,
  };
}
