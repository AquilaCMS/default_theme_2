
import { useSelector } from 'react-redux';

const getStoreData = () => {
    const cmsBlocks = useSelector((state) => state.cmsBlocks);
    return { cmsBlocks };
};

export default function BlockCMS({ nsCode, displayError = true }) {
    const { cmsBlocks } = getStoreData();
    const cmsBlock      = cmsBlocks.find(cms => cms.code === nsCode);

    if(cmsBlock && cmsBlock.content) {
        return <div className={nsCode} dangerouslySetInnerHTML={{ __html: cmsBlock.content }}></div>;
    } else if(displayError) {
        return (
            <div>No BlockCMS for ns-code &apos;{nsCode}&apos;</div>
        );
    }
    else return null;
}
