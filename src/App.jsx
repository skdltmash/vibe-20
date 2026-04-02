import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAllRestaurants } from "./fetchRestaurants.js";
import "./App.css";

const PAGE_SIZE = 12;
const SERVICE_KEY = import.meta.env.VITE_ODCLOUD_SERVICE_KEY;

function filterByNameOrAddress(rows, query) {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => {
    const name = String(row["업소명"] ?? "");
    const road = String(row["소재지도로명주소"] ?? "");
    const jibun = String(row["소재지지번주소"] ?? "");
    return (
      name.toLowerCase().includes(q) ||
      road.toLowerCase().includes(q) ||
      jibun.toLowerCase().includes(q)
    );
  });
}

function RestaurantCard({ row, index }) {
  const name = row["업소명"] ?? "(이름 없음)";
  const kind = row["업종명"] ?? "-";
  const road = row["소재지도로명주소"] ?? "-";
  const jibun = row["소재지지번주소"] ?? "-";
  const area = row["면적"] ?? "-";
  const date = row["데이터기준일"] ?? "-";
  const num = row["연번"] ?? index + 1;

  return (
    <article className="card">
      <span className="card-num">#{num}</span>
      <h2>{name}</h2>
      <span className="badge">{kind}</span>
      <dl>
        <dt>도로명 주소</dt>
        <dd>{road}</dd>
        <dt>지번 주소</dt>
        <dd>{jibun}</dd>
        <dt>면적(㎡)</dt>
        <dd>{area}</dd>
        <dt>데이터 기준일</dt>
        <dd>{date}</dd>
      </dl>
    </article>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAllRestaurants(SERVICE_KEY)
      .then((data) => {
        if (!cancelled) {
          setItems(data);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(
    () => filterByNameOrAddress(items, appliedQuery),
    [items, appliedQuery]
  );

  useEffect(() => {
    if (loading) return;
    setVisibleCount(Math.min(PAGE_SIZE, filteredItems.length));
  }, [loading, filteredItems]);

  const shown = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredItems.length));
  }, [filteredItems.length]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setAppliedQuery(searchInput.trim());
  }, [searchInput]);

  return (
    <div className="wrap">
      <header>
        <h1>광주광역시 서구 음식점</h1>
        <p>
          공공데이터 Open API · 전체 {items.length.toLocaleString("ko-KR")}건
          로드 · 한 화면에 12건(3열×4행)씩 표시
        </p>
      </header>

      {!loading && !error && items.length > 0 && (
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <label className="search-label" htmlFor="restaurant-search">
            식당 이름 또는 주소
          </label>
          <div className="search-row">
            <input
              id="restaurant-search"
              type="search"
              className="search-input"
              placeholder="예: 치킨, 풍서좌로, 벽진동"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="search-btn">
              검색하기
            </button>
          </div>
          {appliedQuery ? (
            <p className="search-result-hint" role="status">
              「{appliedQuery}」 검색 결과{" "}
              {filteredItems.length.toLocaleString("ko-KR")}건
            </p>
          ) : (
            <p className="search-result-hint muted" role="status">
              검색어를 입력한 뒤 [검색하기]를 누르면 이름·주소로 찾습니다.
            </p>
          )}
        </form>
      )}

      {loading && (
        <div className="status" role="status">
          전체 식당 목록을 불러오는 중입니다…
        </div>
      )}

      {!loading && error && (
        <div className="status error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="status">표시할 데이터가 없습니다.</div>
      )}

      {!loading && !error && items.length > 0 && filteredItems.length === 0 && (
        <div className="status">
          「{appliedQuery}」에 해당하는 식당이 없습니다. 다른 검색어로 시도해
          보세요.
        </div>
      )}

      {!loading && !error && items.length > 0 && filteredItems.length > 0 && (
        <>
          <div className="grid">
            {shown.map((row, i) => (
              <RestaurantCard key={i} row={row} index={i} />
            ))}
          </div>
          {hasMore && (
            <div className="more-wrap">
              <button type="button" className="more-btn" onClick={loadMore}>
                더 보기
              </button>
            </div>
          )}
        </>
      )}

      <footer className="footer-note">
        데이터 출처: 행정안전부 공공데이터포털 · 광주광역시 서구
      </footer>
    </div>
  );
}
