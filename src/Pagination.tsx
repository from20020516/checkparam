/** @see https://github.com/jbetancur/react-data-table-component/blob/14e2e7f9eaaf8219e9988867d738c09b78644fcb/src/DataTable/Pagination.tsx */
import React, { FC, useCallback } from 'react';
import { PaginationComponentProps } from 'react-data-table-component';
import styled from 'styled-components';

const PaginationWrapper = styled.nav`
  display: flex;
  flex: 1 1 auto;
  justify-content: flex-end;
  align-items: center;
  box-sizing: border-box;
  padding-right: 8px;
  padding-left: 8px;
  width: 100%;
  ${props => props.theme.pagination.style};
`;

const Button = styled.button`
  position: relative;
  display: block;
  user-select: none;
  border: none;
`;

const PageList = styled.div`
  display: flex;
  align-items: center;
  border-radius: 4px;
  white-space: nowrap;
`;

const Span = styled.span`
  flex-shrink: 1;
  user-select: none;
`;

const Range = styled(Span)`
  margin: 0 24px;
`;

const RowLabel = styled(Span)`
  margin: 0 4px;
`;

const FirstPage: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="presentation"
  >
    <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" />
    <path fill="none" d="M24 24H0V0h24v24z" />
  </svg>
);
const LastPage: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="presentation"
  >
    <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
    <path fill="none" d="M0 0h24v24H0V0z" />
  </svg>
);
const Left: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="presentation"
  >
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
);
const Right: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="presentation"
  >
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
);

const Pagination = ({
  rowsPerPage,
  rowCount,
  onChangePage,
  onChangeRowsPerPage,
  currentPage,
}: PaginationComponentProps) => {
  const numPages = Math.ceil(rowCount / rowsPerPage);
  const handlePrevious = useCallback(
    () => onChangePage(currentPage - 1, rowCount),
    [currentPage, rowCount, onChangePage]
  );
  const handleNext = useCallback(
    () => onChangePage(currentPage + 1, rowCount),
    [currentPage, rowCount, onChangePage]
  );
  const handleFirst = useCallback(
    () => onChangePage(1, rowCount),
    [rowCount, onChangePage]
  );
  const handleLast = useCallback(
    () => onChangePage(numPages, rowCount),
    [onChangePage, rowCount, numPages]
  );
  const rowLabel = `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
    currentPage * rowsPerPage,
    rowCount
  )} of ${rowCount}`;

  return (
    <PaginationWrapper>
      <div>{rowLabel}</div>
      <PageList>
        <Button onClick={handleFirst}>
          <FirstPage />
        </Button>
        <Button onClick={handlePrevious} disabled={currentPage === 1}>
          <Left />
        </Button>
        <Button onClick={handleNext} disabled={currentPage === numPages}>
          <Right />
        </Button>
        <Button onClick={handleLast}>
          <LastPage />
        </Button>
      </PageList>
    </PaginationWrapper>
  );
};

export default Pagination;
