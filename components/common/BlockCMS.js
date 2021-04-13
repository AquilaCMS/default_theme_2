
import { useCmsBlocks } from '@lib/hooks';

export default function BlockCMS({ nsCode, displayError = true }) {
    const { cmsBlocks } = useCmsBlocks();
    
    const cmsBlock = cmsBlocks.find(cms => cms.code === nsCode);

    if (cmsBlock && cmsBlock.content) {
        return <div className={nsCode} dangerouslySetInnerHTML={{ __html: cmsBlock.content }}></div>;
    } else if (displayError) {
        return (
            <div>No BlockCMS for ns-code &apos;{nsCode}&apos;</div>
        );
    }
    else return null;
}
