/// <reference types="immer" />

type ImmerSetter<T> = (draft: import('immer').Draft<T>) => import('immer').Draft<T> | void
