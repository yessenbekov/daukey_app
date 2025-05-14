import React from "react";

const InstagramFeed = () => {
  return (
    <div className="w-full max-w-3xl mx-auto my-10 p-6 bg-[#f5f1e3] dark:bg-[#3e2a17] rounded-lg shadow-xl">
      <h2 className="text-3xl font-serif font-bold text-center text-[#3e2a17] dark:text-[#f5f1e3] mb-6">
        Наш Instagram
      </h2>
      <iframe
        loading="lazy"
        src="https://www.instagram.com/p/CODE_EMBED_HERE/embed"
        width="100%"
        height="500"
        frameBorder="0"
        allowFullScreen
        className="rounded-lg"
      ></iframe>
      <p className="text-center text-[#5a3e1b] dark:text-[#e5d7c3] mt-4">
        Подписывайтесь на нас в{" "}
        <a
          href="https://www.instagram.com/YOUR_INSTAGRAM"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8a623b] dark:text-[#e5d7c3] underline"
        >
          Instagram
        </a>
      </p>
    </div>
  );
};

export default InstagramFeed;
