
import { useEffect, useState }                               from 'react';
import InfiniteScroll                                        from 'react-infinite-scroll-component';
import ReactPaginate                                         from 'react-paginate';
import { useRouter }                                         from 'next/router';
import useTranslation                                        from 'next-translate/useTranslation';
import Button                                                from '@components/ui/Button';
import { useSelectPage, useCategoryProducts, useSiteConfig } from '@lib/hooks';
import { getBodyRequestProductsFromCookie, convertFilter }   from '@lib/utils';

export default function Pagination({ children, getProductsList }) {
    const [pageCount, setPageCount]                 = useState(0);
    const [isLoading, setIsLoading]                 = useState(false);
    const [message, setMessage]                     = useState();
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
    const defaultLimit = themeConfig?.values?.find(t => t.key === 'productsPerPage')?.value || 15;

    // Getting pagination mode (0=normal | 1=infinite scroll | 2=infinite scroll with button)
    const paginationMode = themeConfig?.values?.find(t => t.key === 'infiniteScroll')?.value || 0;

    // Getting URL page
    const [url] = router.asPath.split('?');

    useEffect(() => {
        // Getting body request from cookie
        const bodyRequestProducts = getBodyRequestProductsFromCookie();

        let limit = defaultLimit;
        if (bodyRequestProducts.limit) {
            limit = bodyRequestProducts.limit;
        }

        const count = Math.ceil(categoryProducts.count / limit);
        setPageCount(count);
    }, [url, categoryProducts]);

    const handlePageClick = async (data) => {
        setMessage();

        // Getting body request from cookie
        const bodyRequestProducts = getBodyRequestProductsFromCookie();

        // If the body request cookie does not have the validity key property, reload
        if (!bodyRequestProducts.key) {
            return router.reload();
        }

        // Body request : filter
        const filterRequest = convertFilter(bodyRequestProducts.filter, lang);

        // Body request : page
        const pageRequest = data.selected + 1;
        if (forcePage) {
            return router.push(`${url}?page=${pageRequest}`);
        }
        if (pageRequest > 1) {
            bodyRequestProducts.page = pageRequest;
        } else {
            delete bodyRequestProducts.page;
        }

        // Body request : limit
        let limitRequest = defaultLimit;
        if (bodyRequestProducts.limit) {
            limitRequest = bodyRequestProducts.limit;
        }

        // Body request : sort
        let sortRequest = { sortWeight: -1 };
        if (bodyRequestProducts.sort) {
            const [sortField, sortValue] = bodyRequestProducts.sort.split('|');
            sortRequest                  = { [sortField]: parseInt(sortValue) };
        }

        // Updating the products list
        try {
            const products = await getProductsList({ PostBody: { filter: filterRequest, page: pageRequest, limit: limitRequest, sort: sortRequest } });
            setCategoryProducts(products);

            // Updating category page
            setSelectPage(pageRequest);

            // Setting body request cookie
            document.cookie = 'bodyRequestProducts=' + encodeURIComponent(JSON.stringify(bodyRequestProducts)) + '; path=/; max-age=43200;';
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const loadMoreData = async () => {
        setMessage();
        setIsLoading(true);

        // Getting body request from cookie
        const bodyRequestProducts = getBodyRequestProductsFromCookie();

        // If the body request cookie does not have the validity key property, reload
        if (!bodyRequestProducts.key) {
            return router.reload();
        }

        // Body request : filter
        const filterRequest = convertFilter(bodyRequestProducts.filter, lang);

        // Body request : page
        const pageRequest        = selectPage + 1;
        bodyRequestProducts.page = pageRequest;

        // Body request : limit
        let limitRequest = defaultLimit;
        if (bodyRequestProducts.limit) {
            limitRequest = bodyRequestProducts.limit;
        }

        // Body request : sort
        let sortRequest = { sortWeight: -1 };
        if (bodyRequestProducts.sort) {
            const [sortField, sortValue] = bodyRequestProducts.sort.split('|');
            sortRequest                  = { [sortField]: parseInt(sortValue) };
        }

        // Updating the products list
        try {
            const products         = await getProductsList({ PostBody: { filter: filterRequest, page: pageRequest, limit: limitRequest, sort: sortRequest } });
            categoryProducts.datas = [...categoryProducts.datas, ...products.datas];
            setCategoryProducts({ ...categoryProducts });

            // Updating category page
            setSelectPage(pageRequest);

            // Setting body request cookie
            document.cookie = 'bodyRequestProducts=' + encodeURIComponent(JSON.stringify(bodyRequestProducts)) + '; path=/; max-age=43200;';
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        } finally {
            setIsLoading(false);
        }
    };

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
            {
                message && (
                    <div className={`w-commerce-commerce${message.type}`}>
                        <div>
                            {message.message}
                        </div>
                    </div>
                )
            }
        </div>
    );
}