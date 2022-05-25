
import { useState }                                               from 'react';
import InfiniteScroll                                             from 'react-infinite-scroll-component';
import ReactPaginate                                              from 'react-paginate';
import { useRouter }                                              from 'next/router';
import useTranslation                                             from 'next-translate/useTranslation';
import Button                                                     from '@components/ui/Button';
import { useSelectPage, useCategoryProducts, useSiteConfig }      from '@lib/hooks';
import { getFilterAndSortFromCookie, convertFilter, unsetCookie } from '@lib/utils';

export default function Pagination({ children, getProductsList }) {
    const [isLoading, setIsLoading]                 = useState(false);
    const { selectPage, setSelectPage }             = useSelectPage();
    const { categoryProducts, setCategoryProducts } = useCategoryProducts();
    const { themeConfig }                           = useSiteConfig();
    const router                                    = useRouter();
    const { lang, t }                               = useTranslation();

    // Force page
    let forcePage   = false;
    const queryPage = Number(router.query.page);
    if (queryPage) {
        forcePage = true;
    }

    // Getting Limit for request
    const limit = themeConfig?.values?.find(t => t.key === 'productsPerPage')?.value || 15;

    // Getting pagination mode (0=normal | 1=infinite scroll | 2=infinite scroll with button)
    const paginationMode = themeConfig?.values?.find(t => t.key === 'infiniteScroll')?.value || 0;

    // Getting URL page
    const [url] = router.asPath.split('?');

    const handlePageClick = async (data) => {
        const page = data.selected + 1;

        if (forcePage) {
            return router.push(`${url}?page=${page}`);
        }

        // Getting filter & sort from cookie
        const { filter, sort } = getFilterAndSortFromCookie();

        // If filter empty (cookie not present), reload
        if (!Object.keys(filter).length) {
            return router.reload();
        }

        // Updating the products list
        const products = await getProductsList({ PostBody: { filter: convertFilter(filter, lang), page, limit, sort } });
        setCategoryProducts(products);

        // Updating category page
        setSelectPage(page);

        // Setting category page cookie
        if (page > 1) {
            document.cookie = 'page=' + JSON.stringify({ url, page }) + '; path=/; max-age=43200;';
        } else {
            // Page 1... so useless "page" cookie
            unsetCookie('page');
        }
    };

    const loadMoreData = async () => {
        setIsLoading(true);

        // Getting filter & sort from cookie
        const { filter, sort } = getFilterAndSortFromCookie();

        // If filter empty (cookie not present), reload
        if (!Object.keys(filter).length) {
            return router.reload();
        }

        const page = selectPage + 1;

        // Updating the products list
        const products         = await getProductsList({ PostBody: { filter: convertFilter(filter, lang), page, limit, sort } });
        categoryProducts.datas = [...categoryProducts.datas, ...products.datas];
        setCategoryProducts({ ...categoryProducts });

        // Updating category page
        setSelectPage(page);

        // Setting category page cookie
        document.cookie = 'page=' + JSON.stringify({ url, page }) + '; path=/; max-age=43200;';

        setIsLoading(false);
    };

    const pageCount = Math.ceil(categoryProducts.count / limit);

    return (
        <div className="tab-pane-wrap w-tab-pane w--tab-active">
            <div className="w-dyn-list">
                {
                    paginationMode > 0 && !forcePage ? (
                        <InfiniteScroll
                            dataLength={categoryProducts.datas.length}
                            next={paginationMode > 1 ? undefined : loadMoreData}
                            hasMore={selectPage < pageCount}
                            loader={
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    {
                                        paginationMode > 1 ? (
                                            <Button
                                                type="button"
                                                text={t('components/pagination:loadMoreData')}
                                                loadingText={t('components/pagination:loading')}
                                                isLoading={isLoading}
                                                className="w-commerce-commerceaddtocartbutton order-button"
                                                hookOnClick={loadMoreData}
                                            />
                                        ) : (
                                            <span>{t('components/pagination:loading')}</span>
                                        )
                                    }
                                </div>
                            }
                        >
                            {children}
                        </InfiniteScroll>
                    ) : (
                        children
                    )
                }
            </div>
            {
                pageCount > 1 && (!paginationMode || forcePage) && (
                    <ReactPaginate
                        previousLabel={'<'}
                        nextLabel={'>'}
                        breakLabel={'...'}
                        forcePage={selectPage - 1}
                        pageCount={pageCount}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={handlePageClick}
                        containerClassName={'w-pagination-wrapper pagination'}
                        activeClassName={'active'}
                    />
                )
            }
            
        </div>
    );
}