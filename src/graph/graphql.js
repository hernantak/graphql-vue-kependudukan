import gql from 'graphql-tag'

export const QUERY_ALL_BOOKS = gql`
  query {
    allBooks {
      title
      locationID
      Author{
        firstName
        lastName
      }
    }
  }
`
export const QUERY_ALL_AUTHORS = gql`
  query {
    allAuthors {
      id
      firstName
    }
  }
`

export const MUTATION_CREATE_BOOK = gql`
  mutation CreateBookMutation($title: String!, $locationID: String!, $Author: ID!) {
    createBook(
      title: $title,
      locationID: $locationID,
      Author: $Author,
    ) {
      id
      title
      locationID
      Author{
        id
        firstName
        lastName
      }
    }
  }
`