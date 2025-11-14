const baseStyle = {
  padding: '0.75rem 1rem',
  marginBottom: '1rem',
  border: '2px solid',
  borderRadius: '4px',
  fontWeight: 500,
}

const Notification = ({ message }) => {
  if (!message) return null

  const { text, type } = message
  const style = {
    ...baseStyle,
    color: type === 'error' ? '#721c24' : '#155724',
    backgroundColor: type === 'error' ? '#f8d7da' : '#d4edda',
    borderColor: type === 'error' ? '#f5c6cb' : '#c3e6cb',
  }

  return <div style={style}>{text}</div>
}

export default Notification