const API_URL =
  "https://api.odcloud.kr/api/3083730/v1/uddi:6b8d6f79-21df-434b-aca1-d1c4477b3835";

/** 한 번에 요청할 최대 건수 (API 허용 범위 내) */
const FETCH_PER_PAGE = 1000;

/**
 * 공공데이터 API로 전체 음식점 목록을 모두 불러옵니다.
 * @param {string} serviceKey
 * @returns {Promise<object[]>}
 */
export async function fetchAllRestaurants(serviceKey) {
  if (!serviceKey) {
    throw new Error("VITE_ODCLOUD_SERVICE_KEY가 설정되지 않았습니다.");
  }

  let page = 1;
  let totalCount = Infinity;
  const all = [];

  while (all.length < totalCount) {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(FETCH_PER_PAGE),
      serviceKey,
    });
    const res = await fetch(`${API_URL}?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`API 오류: HTTP ${res.status}`);
    }
    const json = await res.json();
    totalCount = json.totalCount ?? 0;
    const chunk = json.data;
    if (!Array.isArray(chunk) || chunk.length === 0) {
      break;
    }
    all.push(...chunk);
    if (chunk.length < FETCH_PER_PAGE || all.length >= totalCount) {
      break;
    }
    page += 1;
  }

  return all;
}
