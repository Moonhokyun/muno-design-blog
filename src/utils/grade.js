// 등급 정보를 한 곳에서 관리합니다.
export const grades = {
  newbie: { name: "신입", icon: "🐥" },
  steady: { name: "꾸준", icon: "📈" },
  enthusiast: { name: "열혈", icon: "🔥" },
  inactive: { name: "미참여", icon: "👻" },
};

/**
 * 참여 횟수에 따라 사용자 등급을 반환하는 함수
 * @param {number | undefined} participationCount - 사용자의 참여 횟수
 * @returns {object} - 등급 객체 (name, icon 포함)
 */
export function getUserGrade(participationCount) {
  // 참여 횟수 정보가 없거나 숫자가 아니면 '미참여'로 처리 (버그 수정)
  if (
    typeof participationCount !== "number" ||
    isNaN(participationCount) ||
    participationCount < 1
  ) {
    return grades.inactive;
  }
  if (participationCount <= 3) return grades.newbie;
  if (participationCount < 10) return grades.steady;
  return grades.enthusiast;
}

/**
 * 등급 이름에 해당하는 등급 객체를 반환하는 함수 (차트용)
 * @param {string} gradeName - 등급 이름 ('신입', '꾸준' 등)
 * @returns {object} - 등급 객체
 */
export function getGradeByName(gradeName) {
  const gradeKey = Object.keys(grades).find(
    (key) => grades[key].name === gradeName
  );
  return grades[gradeKey];
}
