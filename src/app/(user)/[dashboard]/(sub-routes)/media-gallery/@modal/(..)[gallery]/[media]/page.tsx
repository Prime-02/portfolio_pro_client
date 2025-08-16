// In your modal page.tsx
const page = () => {
  console.log('MODAL RENDERING!');
  return (
    <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999}}>
      <div style={{background: 'white', margin: '50px', padding: '20px'}}>
        Image modal
      </div>
    </div>
  );
}