"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";

import { fetchNotes } from "@/lib/api";

import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteForm from "@/components/NoteForm/NoteForm";
import Modal from "@/components/Modal/Modal";

import css from "./NotesPage.module.css";

const PER_PAGE = 12;

export default function NotesClient() {
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const { data, isPending, isError } = useQuery({
    queryKey: ["notes", search, page],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        search,
      }),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  });

  const handleSearch = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <main className={css.app}>
      <h1>My Notes</h1>

      <div className={css.toolbar}>
        <SearchBox value={inputValue} onChange={handleSearch} />

        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}

        <button
          type="button"
          className={css.button}
          onClick={() => setIsModalOpen(true)}
        >
          Create note +
        </button>
      </div>

      {isPending && <p>Loading, please wait...</p>}

      {isError && <p>Something went wrong.</p>}

      {data && !isPending && !isError && <NoteList notes={data.notes} />}

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <NoteForm onCancel={handleCloseModal} />
        </Modal>
      )}
    </main>
  );
}
