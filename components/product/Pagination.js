
export default function Pagination({ totalItems, itemByPages }) {

    if (totalItems > itemByPages) {
        return (
            <div className="w-pagination-wrapper pagination">
                <a href="#" className="w-pagination-previous pagination-button"><svg className="w-pagination-previous-icon" height="12px" width="12px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" transform="translate(0, 1)">
                    <path fill="none" stroke="currentColor" fillRule="evenodd" d="M8 10L4 6l4-4" />
                </svg>
                <div className="w-inline-block">TODOTRAD Previous</div>
                </a>
                <a href="#" className="w-pagination-next pagination-button">
                    <div className="w-inline-block">TODOTRAD Next</div><svg className="w-pagination-next-icon" height="12px" width="12px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" transform="translate(0, 1)">
                        <path fill="none" stroke="currentColor" fillRule="evenodd" d="M4 2l4 4-4 4" />
                    </svg>
                </a>
            </div>
        );
    }
    else return null;
}