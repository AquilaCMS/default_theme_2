
import { Carousel }    from 'react-responsive-carousel';
import { useSelector } from 'react-redux';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const getStoreData = () => {
    const cmsBlocks = useSelector((state) => state.cmsBlocks);
    return { cmsBlocks };
};

export default function BlockSlider({ nsCodeList }) {

    const { cmsBlocks } = getStoreData();
    const listBlocks    = cmsBlocks.filter((e) => nsCodeList.indexOf(e.code) !== -1);

    if (listBlocks && listBlocks.length > 0) {
        return (
            <Carousel 
                showStatus={false}
                showThumbs={false}
                renderArrowPrev={(onClickHandler, hasPrev, label) =>
                    hasPrev && (
                        <div className="left-arrow w-slider-arrow-left" onClick={onClickHandler} title={label}>
                            <div className="w-icon-slider-left" />
                        </div>
                    )
                }
                renderArrowNext={(onClickHandler, hasNext, label) =>
                    hasNext && (
                        <div className="right-arrow w-slider-arrow-right" onClick={onClickHandler} title={label}>
                            <div className="w-icon-slider-right" />
                        </div>
                    )
                }
            >
                {listBlocks.map((item, index) => (
                    <div key={index} dangerouslySetInnerHTML={{ __html: item.content }} />
                ))}
            </Carousel>
        );
    }
    else return null;
}