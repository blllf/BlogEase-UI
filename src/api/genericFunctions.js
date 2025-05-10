//格式化文本
export const truncateContent = (htmlString, maxLength) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    // 移除图片
    tempDiv.querySelectorAll('img').forEach(img => img.remove());
    let contentText = tempDiv.textContent || tempDiv.innerText || '';
    contentText = contentText
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '')
        .substring(0, maxLength);
    const lastSpaceIndex = contentText.lastIndexOf(' ');
    if (lastSpaceIndex > 0 && contentText.length >= maxLength) {
        contentText = contentText.substring(0, lastSpaceIndex);
    }
    return contentText + (tempDiv.textContent.length > maxLength ? '...' : '');
};

//格式化标题
export const truncateTitle = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};


//格式化时间
export const formatTime = (time) => {
    const now = new Date();
    const diff = now - new Date(time);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) {
        return `${hours}小时前`;
    } else {
        return time.split('T')[0]; // 只显示日期部分
    }
}

