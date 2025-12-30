import React from "react";
import "../css/landingPage.css";

export default function LandingPage({ setCurrentPage }) {
  return (
    <div>
      {/*<head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Cooking Website</title>
        <link rel="stylesheet" href="./dist/assets/index.css" />
      </head>*/}

      <body>
        <header>
          <div classNameName="logo">ABC kitchen</div>
          <nav>
            <ul>
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#content">Content</a>
              </li>
            </ul>
          </nav>
          <div className="auth-buttons">
            <button onClick={() => setCurrentPage("login")}>Login</button>

            <a href="signUp.html">
              <button className="signup">Sign Up</button>
            </a>
          </div>
        </header>

        <section id="home" className="section active">
          <video autoplay muted loop>
            <source src="image/intro.mp4" type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
          <div className="welcome">
            <h1>
              Welcome to <br />
              <span> ABC kitchen</span>
            </h1>
            <p>
              Nơi mỗi bữa ăn là sự quan tâm và sẻ chia giữa những người đồng
              hành.
            </p>
          </div>
        </section>
        <section id="why" className="home1">
          <h2>Tại sao một bữa ăn lại quan trọng đến vậy?</h2>
          <p>
            Chúng tôi tin rằng bữa ăn không chỉ đơn thuần là để no, mà còn là
            niềm vui, sự gắn kết và nguồn cảm hứng sống khỏe.
          </p>

          <div className="features">
            <div className="feature">
              <img src="image/book.png" alt="icon" />
              <p>
                Khám phá hàng trăm công thức món ăn từ đơn giản đến cầu kỳ, phù
                hợp cho tất cả mọi người.
              </p>
            </div>

            <div className="feature">
              <img src="image/fork.png" alt="icon" />
              <p>
                Lên thực đơn theo tuần linh hoạt, phù hợp quy mô và khẩu phần
                bếp ăn doanh nghiệp.
              </p>
            </div>
            <div className="feature">
              <img src="image/cook.png" alt="icon" />
              <p>
                Tuân thủ nghiêm ngặt quy trình an toàn thực phẩm, đảm bảo bữa ăn
                chất lượng cho nhân viên mỗi ngày.
              </p>
            </div>
          </div>
        </section>

        {/*<!-- Trang About Us -->*/}
        <section id="about">
          <h1>About Us</h1>
          <div className="about-container">
            <div className="about-card">
              <p>
                <b>ABC kitchen</b> được thành lập với mục tiêu phát triển mô
                hình bếp ăn doanh nghiệp chuyên nghiệp, mang đến bữa trưa chất
                lượng – an toàn – ngon miệng cho nhân viên làm việc mỗi ngày.
              </p>
              <h3>Sứ mệnh</h3>
              <p>
                ABC kitchen hướng đến việc tối ưu hóa quy trình chuẩn bị bữa ăn
                trong môi trường công ty: từ xây dựng thực đơn theo tuần, kiểm
                soát nguyên liệu đầu vào, đến quản lý suất ăn theo số lượng lớn.
                Chúng tôi mong muốn mang lại một bữa ăn đầy đủ dinh dưỡng, đúng
                thời gian, giúp nhân viên tái tạo năng lượng và duy trì hiệu
                suất công việc.
              </p>
            </div>

            <div className="about-card">
              <h3>Giá trị cốt lõi</h3>
              <ul>
                <li>
                  📌 An toàn thực phẩm – tuân thủ nghiêm quy trình vệ sinh và
                  tiêu chuẩn HACCP.
                </li>
                <li>
                  📌 Tính ổn định – suất ăn đồng đều, khẩu phần rõ ràng, kiểm
                  soát chất lượng.
                </li>
                <li>
                  📌 Tối ưu hiệu quả – giảm lãng phí nguyên liệu, tăng tốc độ
                  phục vụ.
                </li>
                <li>
                  📌 Phong phú & ngon miệng – thực đơn đa dạng, luôn mang lại
                  trải nghiệm ăn ngon mỗi ngày.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div className="contract">
          <h2>Liên hệ</h2>
          <p>Email: Abckitchen@gmail.com Facebook: ABC Kitchen</p>
        </div>
        {/*<!-- Footer -->*/}
        <footer>
          <p>© 2025 ABC Kitchen. All rights reserved.</p>
        </footer>
      </body>
    </div>
  );
}
