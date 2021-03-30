export interface ForumReplySolr {
  id: string; //	diharapkan bisa diambil dari
  comment_id_s: string;
  thread_title_t: string; //	title dari thread
  thread_link_s: string; //	url dari thread
  reply_link_s: string; //	url dari reply
  content_t: string; //	konten dari reply masih berupa HTML tanpa tag style dan script (konten pertama suatu thread dapat dikategorikan sebagai reply)
  clean_content_t: string; //	konten dari reply tanpa HTML sama sekali (konten pertama suatu thread dapat dikategorikan sebagai reply)
  published_ts_l: number; //	unix timestamp thread ini dibuat
  reply_author_s: string; //	username dari pembuat reply (konten pertama suatu thread dapat dikategorikan sebagai reply)
  language_s: string; //	bahasa yang digunakan dalam thread in lowercase (refer to iso 639-1)
  country_code_s: string; //	negara dari forum in lowercase (refer to iso 3166-1 alpha-2)
  crawled_ts_l: number; //	unix timestamp pertama kali thread ini diambil datanya
  updated_ts_l: number; //	unix timestamp pertama kali thread ini diupdate datanya
  created_ts_l: number; //	unix timestamp pertama kali thread ini dicreate datanya
  section_link_s: string; // section link
  section_title_t: string; // section title
  media_id_i: number; //media id
  site_s: string; // origin site tanpa http://
  page_no_i: number;
  is_post_b:boolean;// flag for thread starter reply
}
