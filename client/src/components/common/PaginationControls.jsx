import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function PaginationControls({ currentPage, totalPages, onPageChange }) {
  let prevDots = false;
  let nextDots = false;

  return (
    <Pagination className="justify-center mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={
              currentPage > 1 ? () => onPageChange(currentPage - 1) : undefined
            }
            className="cursor-pointer select-none"
          />
        </PaginationItem>

        {totalPages > 1 &&
          Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;

            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              currentPage === pageNumber ||
              currentPage - 1 === pageNumber ||
              currentPage + 1 === pageNumber
            ) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => onPageChange(pageNumber)}
                    isActive={pageNumber === currentPage}
                    className="cursor-pointer select-none"
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            } else if (pageNumber < currentPage && !prevDots) {
              prevDots = true;
              return <PaginationEllipsis key={`dots-prev-${pageNumber}`} />;
            } else if (pageNumber > currentPage && !nextDots) {
              nextDots = true;
              return <PaginationEllipsis key={`dots-next-${pageNumber}`} />;
            }
          })}

        <PaginationItem>
          <PaginationNext
            onClick={
              currentPage < totalPages
                ? () => onPageChange(currentPage + 1)
                : undefined
            }
            className="cursor-pointer select-none"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default PaginationControls;
