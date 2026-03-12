const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(
      result?.detail || 
      result?.message || 
      "Login failed"
    );
  }

  return {
    data: result,
    status: res.status
  };
}

export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(
      result?.detail || 
      result?.message || 
      "Registration failed"
    );
  }

  return {
    data: result,
    status: res.status
  };
}
