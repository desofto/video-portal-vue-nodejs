
module.exports = async () => {
  const { query } = require("../../db")

  const sql = `
    insert into videos(id, name, poster_url, created_at) values($1, $2, $3, $4)
  `
  
  await query(sql, [1, "Car sale", "https://res.cloudinary.com/dt6b7ywnt/image/upload/c_scale,f_auto,w_900/assets/products/custom-self-adhesive-posters-QeUON68kWscsE81NDP.jpg", new Date()])
  await query(sql, [2, "Alternative Movie Posters", "https://images-na.ssl-images-amazon.com/images/I/512CTuyuKtL._SX387_BO1,204,203,200_.jpg", new Date()])
  await query(sql, [3, "Beef Cuts Poster", "https://posterstore.eu/images/zoom/beef-cuts.jpg", new Date()])
  await query(sql, [4, "Outdoor Posters", "https://www.tradeprint.co.uk/dam/jcr:803293eb-268f-4041-8d27-7a9a02977143/comp_a1poster_170629_0282B_800x800.jpg", new Date()])
}
