import React from 'react';
import { Link } from 'react-router-dom';
import './BlogPage.css';

// --- Dữ liệu mẫu cho các bài viết ---
const mockPosts = [
    {
        id: 1,
        title: 'Bí quyết nước dùng Phở chuẩn vị Hà Nội',
        excerpt: 'Khám phá công thức bí truyền để có một nồi nước dùng phở trong, ngọt thanh và đậm đà hương vị xương bò...',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        date: { day: '15', month: 'Th11' },
        slug: 'bi-quyet-nuoc-dung-pho'
    },
    {
        id: 2,
        title: 'Ramen Tonkotsu: Hành trình từ Fukuoka đến bàn ăn',
        excerpt: 'Nước dùng xương heo hầm trong nhiều giờ, sợi mì dai hoàn hảo và những lát chashu mềm tan. Cùng tìm hiểu về món mì quốc hồn quốc túy của Nhật Bản.',
        image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        date: { day: '10', month: 'Th11' },
        slug: 'ramen-tonkotsu-hanh-trinh'
    },
    {
        id: 3,
        title: '5 loại mì Ý bạn nhất định phải thử một lần',
        excerpt: 'Ngoài Carbonara, thế giới mì Ý còn vô vàn những món ăn hấp dẫn khác. Hãy cùng chúng tôi điểm qua 5 cái tên không thể bỏ lỡ.',
        image: 'https://images.pexels.com/photos/128408/pexels-photo-128408.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        date: { day: '05', month: 'Th11' },
        slug: '5-loai-my-y'
    }
];

// Component cho một bài viết
const PostItem = ({ post }) => (
    <div className="post-item">
        <div className="post-item-inner">
            <Link to={`/blog/${post.slug}`} className="post-link">
                <div className="post-box">
                    <div className="post-image">
                        <div className="image-cover" style={{ backgroundImage: `url(${post.image})` }}></div>
                    </div>
                    <div className="post-text">
                        <div className="post-text-inner">
                            <h5 className="post-title">{post.title}</h5>
                            <div className="divider"></div>
                            <p className="post-excerpt">{post.excerpt}</p>
                        </div>
                    </div>
                    <div className="post-date-badge">
                        <div className="badge-inner">
                            <span className="day">{post.date.day}</span>
                            <span className="month">{post.date.month}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    </div>
);

// Component cho Sidebar
const BlogSidebar = () => (
    <div className="blog-sidebar">
        <aside className="widget">
            <span className="widget-title"><span>Bài viết mới</span></span>
            <div className="divider small"></div>
            <ul>
                {mockPosts.map(post => (
                    <li key={post.id}>
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </li>
                ))}
            </ul>
        </aside>
        <aside className="widget">
            <span className="widget-title"><span>Chuyên mục</span></span>
            <div className="divider small"></div>
            <ul>
                <li><Link to="/category/tin-tuc">Tin tức</Link></li>
                <li><Link to="/category/kham-pha">Khám phá ẩm thực</Link></li>
                <li><Link to="/category/khuyen-mai">Khuyến mãi</Link></li>
            </ul>
        </aside>
    </div>
);

const BlogPage = () => {
    return (
        <div className="blog-page-wrapper">
            <div className="blog-container">
                {/* Cột chính chứa bài viết */}
                <div className="main-content-column">
                    <div className="posts-list">
                        {mockPosts.map(post => (
                            <PostItem key={post.id} post={post} />
                        ))}
                    </div>
                </div>

                {/* Cột sidebar */}
                <div className="sidebar-column">
                    <BlogSidebar />
                </div>
            </div>
        </div>
    );
};

export default BlogPage;