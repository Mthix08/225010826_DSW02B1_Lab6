const NOTICES_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';
const NOTICE_LIMIT = 10;

export async function fetchCampusNotices() {

  

  // i did this on purpose to make the user wait for 4 seconds to simulate a slow network request.
  await new Promise(resolve => setTimeout(resolve, 4000));

  const response = await fetch(NOTICES_ENDPOINT);

  if (!response.ok) {
    throw new Error(`Notice request failed with status ${response.status}`);
  }

  const posts = await response.json();

  if (!Array.isArray(posts)) {
    throw new Error('Notice response was not a list');
  }

  return posts.slice(0, NOTICE_LIMIT);
}
