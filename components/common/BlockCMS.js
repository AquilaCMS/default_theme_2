import React                 from 'react';
import parse, { domToReact } from 'html-react-parser';
import Contact               from '@components/ns/Contact';
import { useCmsBlocks }      from '@lib/hooks';

export default function BlockCMS({ nsCode, content = '', displayError = false }) {
    const cmsBlocks = useCmsBlocks();
    let html        = '';
    if (content) {
        html = content;
    } else {
        html = cmsBlocks.find(cms => cms.code === nsCode)?.content;
    }
    
    // Next Sourcia components array
    const nsComponents = {
        'ns-contact': <Contact />
    };

    const options = {
        replace: ({ type, name, attribs, children }) => {
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
