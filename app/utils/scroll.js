
function onScroll(options) {

    const el = options.el;
    const scrollDirection = options.handleScrollDirection;
    const reload = options.handleReload;
    const loadMore = options.handleReload;

    const currentOffset = el.scrollProperties.offset;
    const visibleLegth = el.scrollProperties.visibleLength;
    const contentLength = el.scrollProperties.contentLength;

    if (currentOffset !== this.offset) showHeader = currentOffset < this.offset;
    if (currentOffset < 50) showHeader = true;
    if (showHeader != null) this.setState({ showHeader });
    this.offset = currentOffset;

    if (this.props.view.discover === 3) return;

    if (currentOffset < -100) this.reload();

    if (currentOffset > 100 && currentOffset + visibleLegth > contentLength + 5) {
      this.loadMore();
    }
}