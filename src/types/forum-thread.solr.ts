export interface ForumPostSolr {
  id: string; //	Saat ini kita menggunakan URL sebagai ID-nya
  thread_id_s: string; // thread id
  media_id_i: number; // media id
  section_link_s: string; //	link subforum tempat kita mendapatkan link threads (contoh: http://arofanatics.com/forums/forumdisplay.php?f=17)
  section_title_t: string; //	title dari subforum (Chatterbox dari http://arofanatics.com/forums/forumdisplay.php?f=17)
  thread_title_t: string; //	title dari thread
  thread_link_s: string; //	url dari thread
  content_t: string; //	konten pertama dari thread, masih ada HTML tapi tanpa tag style dan script
  clean_content_t: string; //	konten pertama dari thread, hanya text tanpa html tags sama sekali
  published_ts_l: number; //	unix timestamp thread ini dibuat
  num_replies_i: number; //	jumlah replies di satu thread
  num_views_i: number; //	jumlah views satu thread
  last_post_ts_l: number; //	unix timestamp dari reply yang terakhir kali
  thread_author_s: string; //	username dari pembuat thread
  thread_author_lower_s: string; //	username dari pembuat thread in lower-case
  site_s: string; //	versi tanpa www. , contoh: www.kaskus.co.id akan ditulis kaskus.co.id . Untuk forum.lowyat.net akan ditulis forum.lowyat.net
  language_s: string; //	bahasa yang digunakan dalam thread in lowercase (refer to iso 639-1)
  country_code_s: string; //	negara dari forum in lowercase (refer to iso 3166-1 alpha-2)
  crawled_ts_l: number; //	unix timestamp pertama kali thread ini diambil datanya
  updated_ts_l: number; //	unix timestamp pertama kali thread ini diupdate datanya
  created_ts_l: number; //	unix timestamp pertama kali thread ini dicreate datanya
}
