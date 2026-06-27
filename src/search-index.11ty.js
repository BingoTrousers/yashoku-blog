class SearchIndex {
  data() {
    return {
      permalink: "/search-index.json",
      eleventyExcludeFromCollections: true,
    };
  }

  render({ collections }) {
    const posts = (collections.posts || []).map((post) => ({
      title: post.data.title,
      description: post.data.description || "",
      url: post.url,
      tags: (post.data.tags || []).filter((t) => t !== "posts"),
    }));
    return JSON.stringify(posts);
  }
}

module.exports = SearchIndex;
