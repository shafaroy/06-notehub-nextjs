"use client";
import css from "./NotesPage.module.css";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";

import { fetchNotes, deleteNote, createNote } from "@/lib/api";
import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteForm from "@/components/NoteForm/NoteForm";
import Modal from "@/components/Modal/Modal";

const PER_PAGE = 12;

export default function NotesClient() {
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

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
    refetchOnMount: false,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSearch("");
      setInputValue("");
      setPage(1);
      setIsModalOpen(false);
    },
  });

  const handleSearch = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleCloseModal = () => {
    if (!createMutation.isPending) {
      setIsModalOpen(false);
    }
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
          onClick={() => {
            createMutation.reset();
            setIsModalOpen(true);
          }}
        >
          Create note +
        </button>
      </div>

      {isPending && <p>Loading, please wait...</p>}
      {isError && <p>Something went wrong.</p>}

      {data && !isPending && !isError && (
        <NoteList notes={data.notes} onDelete={handleDelete} />
      )}

      {deleteMutation.isError && (
        <p>Could not delete note. Please try again.</p>
      )}

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <NoteForm
            onSubmit={(note) => createMutation.mutate(note)}
            onCancel={handleCloseModal}
            isSubmitting={createMutation.isPending}
          />
          {createMutation.isError && (
            <p>Could not create note. Please try again.</p>
          )}
        </Modal>
      )}
    </main>
  );
}
