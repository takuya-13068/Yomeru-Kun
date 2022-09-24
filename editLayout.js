/*
    漫画のデータのレイアウトを編集する関数

    漫画のコマのデータは以下の形式で受け渡し
    frames[{page:0, pos:{x:12, y:34}, imgData:[0,0,2,1,0, ...]},    // １コマ目　
        {page:0, pos:{x:12, y:34}, imgData:[0,0,2,1,0, ...]},       // ２コマ目
        {page:0, pos:{x:12, y:34}, imgData:[0,0,2,1,0, ...]}, ...   // ３コマ目
        ]

    pageはもともと何ページ目にあったか、pos.xはもともとのページ内におけるx座標、pos.yはy座標、imgDataは長方形に切り取ったコマのimgData
    imgDataは、切り取ったあとのコマを"canvas1"の(0,0)から(W,H)の長方形領域に描いた場合、imgData=canvas1.getImageData(0,0,W,H); で取得可能
*/

