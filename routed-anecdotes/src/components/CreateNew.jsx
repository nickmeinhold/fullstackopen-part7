import { useField } from "../hooks";

const CreateNew = ({ addNew }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    addNew({
      content: contentField.value,
      author: authorField.value,
      info: infoField.value,
      votes: 0,
    });
  };

  const contentField = useField("text");
  const authorField = useField("text");
  const infoField = useField("text");

  return (
    <div>
      <h2>create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div>
          content
          <input {...contentField} />
        </div>
        <div>
          author
          <input {...authorField} />
        </div>
        <div>
          url for more info
          <input {...infoField} />
        </div>
        <button>create</button>
      </form>
    </div>
  );
};

export default CreateNew;
