Chức năng của Input Options như sau

1. Đang search:
   - Bắn event search
   - Chưa selectItem
   - propsValue chưa thay đổi
   - currentValue = 0
   - Đang search: xóa search đến hết
       + nếu propsValue có (vì lúc search có xóa đâu)
       + emit thêm: update:value = 0, selectItem = null
       + currentValue = 0

   - Đang search mà search đúng ra giá trị của propText (lấy text từ itemSelect)
       + set currentValue về giá trị value 
   - Đang search giá trị khác propsText
       + set currentValue = 0, // mục đích cho click ra ngoài

2. Click ra ngoài:
   - nếu currentValue đang có: không làm gì cả
   - nếu currentValue không có:
     - nếu PropsValue có
       . emit update:value = 0
     - nếu PropsValue không có:
       . Nếu có text, set text = '', emit update:text
       . Nếu không có text, không làm gì
3. Click select
   - Emit select event
   - Emit update:value
   - set text và emit update:text
   - Không emit searchText

4. Lắng nghe propsValue
   - Nếu có thay đổi:
      + currentValue thay đổi theo nếu khác
      + searchText cũng thay đổi theo nếu khác
      + không Emit selectItem, updateVue, không emit gì cả

5. Lắng nghe propsOptions
   - Nếu có thay đổi:
      + currentValue thay đổi theo nếu khác
      + searchText cũng thay đổi theo nếu khác
      + không Emit selectItem, updateVue, không emit gì cả


