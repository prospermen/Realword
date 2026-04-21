import ArticleList from '../components/article/ArticleList';
import TagList from '../components/article/TagList';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Pagination from '../components/common/Pagination';
import PageHeader from '../components/common/PageHeader';
import { useHomeFeed } from '../features/home/useHomeFeed';
import { useAuthStore } from '../store/authStore';

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    articles,
    loading,
    error,
    emptyText,
    listTitle,
    listDescription,
    retryArticles,
    handleArticleUpdated,
    tags,
    loadingTags,
    tagsError,
    selectedTag,
    feedTab,
    handleChangeFeedTab,
    handleSelectTag,
    clearTagFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    searchInput,
    setSearchInput,
    appliedSearch,
    submitSearch,
    clearSearch,
    sort,
    changeSort,
  } = useHomeFeed(isAuthenticated);

  function getFeedNavButtonStyle(isActive: boolean) {
    return `tab-button ${isActive ? 'active' : ''}`.trim();
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    submitSearch();
  }

  return (
    <section>
      <PageHeader
        title="Home"
        description="Browse the global feed, search the archive, or switch to your personalized feed."
      />

      <div
        className="app-card"
        style={{
          padding: 18,
          marginBottom: 18,
          background: 'var(--app-surface-soft)',
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'grid', gap: 12, gridTemplateColumns: 'minmax(0, 1fr)' }}
        >
          <Input
            type="search"
            placeholder="Search by title, description, or content"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button type="submit" variant="primary" size="sm">
              Search
            </Button>

            {(appliedSearch || searchInput) ? (
              <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>
                Clear Search
              </Button>
            ) : null}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
              <Button
                type="button"
                variant={sort === 'latest' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => changeSort('latest')}
              >
                Latest
              </Button>
              <Button
                type="button"
                variant={sort === 'popular' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => changeSort('popular')}
              >
                Popular
              </Button>
              <Button
                type="button"
                variant={sort === 'oldest' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => changeSort('oldest')}
              >
                Oldest
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="tab-strip">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => handleChangeFeedTab('your')}
            className={getFeedNavButtonStyle(!selectedTag && feedTab === 'your')}
          >
            Your Feed
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => handleChangeFeedTab('global')}
          className={getFeedNavButtonStyle(!selectedTag && feedTab === 'global')}
        >
          Global Feed
        </button>

        {selectedTag ? (
          <button type="button" onClick={clearTagFilter} className="tab-button active">
            #{selectedTag}
          </button>
        ) : null}
      </div>

      <div className="home-layout">
        <div>
          <ArticleList
            articles={articles}
            loading={loading}
            error={error}
            emptyText={emptyText}
            emptyDescription="Try changing the search, sort order, or active feed."
            title={listTitle}
            description={listDescription}
            showCount
            onRetry={retryArticles}
            onArticleUpdated={handleArticleUpdated}
          />

          {!loading && !error ? (
            <div style={{ marginTop: 16 }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : null}
        </div>

        <aside className="page-aside">
          <TagList
            tags={tags}
            selectedTag={selectedTag}
            onSelectTag={handleSelectTag}
            loading={loadingTags}
            error={tagsError}
            title="Popular Tags"
            emptyText="No tags available."
          />
        </aside>
      </div>
    </section>
  );
}
