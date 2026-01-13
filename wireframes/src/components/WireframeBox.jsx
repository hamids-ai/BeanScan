function WireframeBox({ children, variant = 'default', style = {} }) {
  const className = `wire-box ${variant === 'solid' ? 'solid' : ''} ${variant === 'dark' ? 'dark' : ''} ${variant === 'light' ? 'light' : ''}`

  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}

export default WireframeBox
