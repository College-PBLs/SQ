import BASE_URL from '../config';

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    const errorMessage =
      result?.error ||
      result?.detail ||
      result?.message ||
      Object.values(result)?.flat()?.[0] ||
      "Login failed";

    throw new Error(errorMessage);
  }

  return result;   // return API response directly
}

export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    const errorMessage =
      result?.error ||
      result?.detail ||
      result?.message ||
      Object.values(result)?.flat()?.[0] ||
      "Registration failed";

    throw new Error(errorMessage);
  }

  return result;   
}