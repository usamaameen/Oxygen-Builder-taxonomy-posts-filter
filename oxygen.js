(function($) {
    // Custom case-insensitive contains selector
    $.expr[":"].CIcontains = $.expr.createPseudo(function(arg) {
        return function(elem) {
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });

    let currentIndex = 0;
    const itemsPerPage = 6;
    let allItemsLoaded = false;
    let loading = false; // To prevent multiple simultaneous loads

    function showCheckboxes() {
        const $checkboxGroup = $('.checkbox-group');
        const totalItems = $checkboxGroup.children('.checkbox-item').length;
        const maxIndex = Math.ceil(totalItems / itemsPerPage) - 1;

        const itemWidth = $('.checkbox-item').outerWidth(true); // Including margin
        const translateX = currentIndex * itemsPerPage * itemWidth;
        $checkboxGroup.css('transform', `translateX(-${translateX}px)`);

        $('.prev').toggleClass('active', currentIndex > 0);
        $('.next').toggleClass('active', currentIndex < maxIndex);
    }

    $('.prev').click(function() {
        if (currentIndex > 0) {
            currentIndex--;
            showCheckboxes();
        }
    });

    $('.next').click(function() {
        const $checkboxGroup = $('.checkbox-group');
        const totalItems = $checkboxGroup.children('.checkbox-item').length;
        if (currentIndex < Math.ceil(totalItems / itemsPerPage) - 1) {
            currentIndex++;
            showCheckboxes();
        }
    });

    $('#filter').keyup(function() {
        var curr_text = $(this).val();
        loadAllAndFilter(curr_text);
    });

    $('.fast-filter input[type="checkbox"]').change(function() {
        var thisID = $(this).attr('id');

        $('.fast-filter input[type="checkbox"]').each(function() {
            if ($(this).attr('id') != thisID) {
                $(this).prop('checked', false);
            }
        });

        if ($(this).is(':checked')) {
            var curr_text = $(this).data('search-term');
            refreshPageWithFilter(curr_text);
        } else {
            refreshPageWithFilter('');
        }
    });

    function filterResults(curr_text) {
        if (!curr_text) {
            $('.card').show();
        } else {
            $('.card').hide();
            $('.card:CIcontains("' + curr_text + '")').show();
        }
    }

    function loadAllAndFilter(filterText) {
        if (loading) return;
        loading = true;
        allItemsLoaded = false;

        // Load all pages and then filter
        function loadNextPageAndFilter() {
            if (!allItemsLoaded) {
                infScroll.once('append', function() {
                    filterResults(filterText);
                    loadNextPageAndFilter();
                    updateAnchors(); // Update anchors after new items are appended
                });
                infScroll.once('last', function() {
                    allItemsLoaded = true;
                    filterResults(filterText); // Final filter after all pages are loaded
                    loading = false;
                });
                infScroll.loadNextPage();
            } else {
                filterResults(filterText); // Filter in case all items are already loaded
                loading = false;
            }
        }

        loadNextPageAndFilter();
    }

    function updateAnchors() {
        var anchors = document.querySelectorAll('a');

        anchors.forEach(function(anchor) {
            var href = anchor.getAttribute('href');

            if (href.includes('green')) {
                anchor.classList.add('green-icon');
                anchor.textContent = ''; 
            } else if (href.includes('orange')) {
                anchor.classList.add('orange-icon');
                anchor.textContent = ''; 
            } else if (href.includes('all-list-types')) {
                anchor.textContent = ''; 
            }
        });
    }

    function refreshPageWithFilter(filterText) {
        let url = new URL(window.location.href);
        url.searchParams.set('filter', filterText);
        window.location.href = url.toString();
    }

    // Initial call to show the first set of checkboxes
    showCheckboxes();

    // Initial call to update anchors
    updateAnchors();

    // Initialize Infinite Scroll
    let infScroll = new InfiniteScroll('.oxy-dynamic-list', {
        path: '.next.page-numbers',
        append: '.oxy-dynamic-list > .ct-div-block',
        history: false,
        button: '.view-more-button',
        scrollThreshold: false,
        status: '.page-load-status', // Add status element for progress indication
    });

    infScroll.on('append', function() {
        let curr_text = $('#filter').val();
        filterResults(curr_text); // Re-apply filter after loading more items
        updateAnchors(); // Update anchors after new items are appended
    });

    infScroll.on('last', function() {
        allItemsLoaded = true;
        console.log('No more pages to load');
    });

    $(window).resize(showCheckboxes);

    // Apply filter from URL on page load
    $(document).ready(function() {
        let url = new URL(window.location.href);
        let filter = url.searchParams.get('filter');
        if (filter) {
            $('#filter').val(filter);
            loadAllAndFilter(filter);
        }
    });

})(jQuery);
