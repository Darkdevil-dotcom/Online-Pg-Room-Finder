(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'refreshToken=dummy'
      }
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
})();
