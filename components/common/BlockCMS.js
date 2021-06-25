import React                                    from 'react';
import Link                                     from 'next/link';
import parse, { attributesToProps, domToReact } from 'html-react-parser';
import BlogList                                 from '@components/common/BlogList';
import Contact                                  from '@components/common/Contact';
import Gallery                                  from '@components/common/Gallery';
import ProductList                              from '@components/product/ProductList';
import Slider                                   from '@components/common/Slider';
import { useCmsBlocks, useComponentData }       from '@lib/hooks';

export default function BlockCMS({ nsCode, content = '', displayError = false, recursion = 0 }) {
    const cmsBlocks     = useCmsBlocks();
    const componentData = useComponentData();
    
    let html = '';
    if (content) {
        html = content;
    } else {
        html = cmsBlocks.find(cms => cms.code === nsCode)?.content || componentData[`nsCms_${nsCode}`]?.content;
    }

    // Next Sourcia components array
    const nsComponents = {
        'ns-blog-articles'    : <BlogList />,
        'ns-contact'          : <Contact />,
        'ns-gallery'          : <Gallery />,
        'ns-product-card-list': <ProductList />,
        'ns-slider'           : <Slider />
    };

    const options = {
        replace: ({ type, name, attribs, children }) => {
            // Replace <ns-[...]> by React Next Sourcia component
            if (type === 'tag' && name && nsComponents[name]) {
                const component = React.cloneElement(
                    nsComponents[name],
                    {
                        ...attribs,
                        children: domToReact(children, options)
                    }
                );
                return component;
            }

            // Replace <ns-cms> by <BlockCMS>
            if (name === 'ns-cms') {
                if (!attribs['ns-code']) {
                    return;
                }
                
                // IMPORTANT : Detection of infinite loops in the CMS block
                if (nsCode === attribs['ns-code']) {
                    console.error(`Infinite loop detected in CMS block "${attribs['ns-code']}" !\nCheck the content of this CMS block !`);
                    return;
                }
                // IMPORTANT : Recursion limit to avoid infinite loops (fixed at 10)
                if (recursion > 10) {
                    console.error(`Recursion limit reached on CMS block "${attribs['ns-code']}" !\nCheck the content of this CMS block !`);
                    return;
                }

                const component = React.cloneElement(<BlockCMS />, { nsCode: attribs['ns-code'], recursion: recursion + 1 });
                return component;
            }

            // Replace <a> by Next link
            if (type === 'tag' && name === 'a') {
                // if no href => home page
                if (!attribs.href) {
                    attribs.href = '/';
                }
                if (attribs.href.startsWith('/') && !attribs.href.match(/\.[a-z0-9]{1,}$/i)) {
                    return React.cloneElement(
                        <Link>
                            {
                                React.createElement(
                                    'a',
                                    { ...attributesToProps(attribs) },
                                    domToReact(children, options)
                                )
                            }
                        </Link>,
                        {
                            href: attribs.href
                        }
                    );
                }
            }
        }
    };

    if (html) {
        return <>{parse(html, options)}</>;
    } else if (displayError) {
        return (
            <div>No BlockCMS for ns-code &apos;{nsCode}&apos;</div>
        );
    } else {
        return null;
    }
}
