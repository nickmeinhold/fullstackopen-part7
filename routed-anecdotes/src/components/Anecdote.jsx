const Anecdote = ({ anecdote }) => {
  return (
    <>
      <h1>{anecdote.content}</h1>
      <br></br>
      <div>Votes {anecdote.votes}</div>
      <br></br>
      <div>
        For more info see <a href={anecdote.info}>{anecdote.info}</a>
      </div>
      <br></br>
    </>
  );
};

export default Anecdote;
