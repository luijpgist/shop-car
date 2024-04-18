class UIGoods {
    constructor(g) {
        this.data = g;
        this.choose = 0;
    }

    getTotalPrice() {
        return this.data.price * this.choose;
    }

    isChoose() {
        return this.choose > 0;
    }

    increase() {
        this.choose++;
    }

    decrease() {
        if (this.choose === 0) {
            return;
        }
        this.choose--;
    }

}

class UIData {
    constructor() {
        var uiGoods = [];
        for (var i = 0; i < goods.length; i++) {
            var uig = new UIGoods(goods[i]);
            uiGoods.push(uig);
        }
        this.uiGoods = uiGoods;
        this.deliveryThreshold = 30;
        this.deliveryPrice = 5;
    }

    getTotalPrice() {
        var sum = 0;
        for (var i = 0; i < this.uiGoods.length; i++) {
            var g = this.uiGoods[i];
            sum += g.getTotalPrice();
        }
        return sum;
    }

    increase(index) {
        this.uiGoods[index].increase();
    }

    decrease(index) {
        this.uiGoods[index].decrease();
    }

    getTotalChooseNumber() {
        var sum = 0;
        for (var i = 0; i < this.uiGoods.length; i++) {
            sum += this.uiGoods[i].choose;
        }
        return sum;
    }

    hasGoodsInCar() {
        return this.getTotalChooseNumber() > 0;
    }

    isCrossDeliveryThreshold(){
        return this.getTotalPrice() >= this.deliveryThreshold;
    }

    isChoose(index){
        return this.uiGoods[index].isChoose() ;
    }
}

class UI{
    constructor() {
        this.uiData = new UIData();
        this.doms = {
            goodsContainer: document.querySelector('.goods-list'),
            deliveryPrice: document.querySelector('.footer-car-tip'),
            footerPay: document.querySelector('.footer-pay'),
            footerPayInnerSpan: document.querySelector('.footer-pay span'),
            totalPrice: document.querySelector('.footer-car-total'),
            car: document.querySelector('.footer-car'),
            badge: document.querySelector('.footer-car-badge'),
        };
        var carRect = this.doms.car.getBoundingClientRect();
        var jumpTarget = {
            x: carRect.left + carRect.width * 0.5,
            y: carRect.top + carRect.height * 0.1,
        };

        this.jumpTarget = jumpTarget;
        this.createHTML();
        this.updateFooter();
        this.listenEvent();
    }

    listenEvent(){
        this.doms.car.addEventListener('animationend', function(){
            this.classList.remove('animate');
        });
    }

    createHTML(){
        var html = '';
        for (var i = 0; i < this.uiData.uiGoods.length; i++){
            var g = this.uiData.uiGoods[i];
            html += `<div class="goods-item">
          <img src="${g.data.pic}" alt="" class="goods-pic" />
          <div class="goods-info">
            <h2 class="goods-title">${g.data.title}</h2>
            <p class="goods-desc">
              ${g.data.description}
            </p>
            <p class="goods-sell">
              <span>月售 ${g.data.sellNumber}</span>
              <span>好评率${g.data.favorRate}%</span>
            </p>
            <div class="goods-confirm">
              <p class="goods-price">
                <span class="goods-price-unit">￥</span>
                <span>${g.data.price}</span>
              </p>
              <div class="goods-btns">
                <i index="${i}" class="iconfont i-jianhao"></i>
                <span>${g.choose}</span>
                <i index="${i}" class="iconfont i-jiajianzujianjiahao"></i>
              </div>
            </div>
          </div>
        </div>`;
        }
        this.doms.goodsContainer.innerHTML = html;
    }

    increase(index) {
        this.uiData.increase(index);
        this.updateGoodsItem(index);
        this.updateFooter();
        this.jump(index);
    }

    decrease(index) {
        this.uiData.decrease(index);
        this.updateGoodsItem(index);
        this.updateFooter();
    }

    updateGoodsItem(index){
        var goodsDom = this.doms.goodsContainer.children[index];
        if(this.uiData.isChoose(index)){
            goodsDom.classList.add('active');
        }else {
            goodsDom.classList.remove('active');
        }
        var span = goodsDom.querySelector('.goods-btns span');
        span.textContent = this.uiData.uiGoods[index].choose;

    }

    updateFooter(){
        var total = this.uiData.getTotalPrice();
        this.doms.deliveryPrice.textContent = `配送费￥${this.uiData.deliveryPrice}`;
        if(this.uiData.isCrossDeliveryThreshold()){
            this.doms.footerPay.classList.add('active');
        }else{
            this.doms.footerPay.classList.remove('active');
            var dis = this.uiData.deliveryThreshold - total;
            dis = Math.round(dis);
            this.doms.footerPayInnerSpan.textContent = `还差￥${dis}元起送`;
        }
        this.doms.totalPrice.textContent = total.toFixed(2);
        if(this.uiData.hasGoodsInCar()){
            this.doms.car.classList.add('active');
        }else{
            this.doms.car.classList.remove('active');
        }
        this.doms.badge.textContent = this.uiData.getTotalChooseNumber();
    }

    carAnimate(){
        this.doms.car.classList.add('animate');
    }

    jump(index){
        var btnAdd = this.doms.goodsContainer.children[index]
            .querySelector('.i-jiajianzujianjiahao');
        var rect = btnAdd.getBoundingClientRect();
        var start = {
            x: rect.left,
            y: rect.top,
        };
        var div = document.createElement('div');
        div.className = 'add-to-car';
        var i = document.createElement('i');
        i.className = 'iconfont i-jianhao'
        div.style.transform = `translateX(${start.x}px)`;
        i.style.transform = `translateY(${start.y}px)`;
        div.appendChild(i);
        document.body.appendChild(div);

        //reflow强制渲染
        div.clientHeight;

        div.style.transform = `translateX(${this.jumpTarget.x}px)`;
        i.style.transform = `translateY(${this.jumpTarget.y}px)`;
        var that = this;
        div.addEventListener('transitionend',function (){
            div.remove();
            that.carAnimate();
        },{once:true});
    }
}

var ui = new UI();

ui.doms.goodsContainer.addEventListener('click', function(e){
    if(e.target.classList.contains('i-jiajianzujianjiahao')){
        ui.increase(+e.target.getAttribute('index'));
    }else if(e.target.classList.contains('i-jianhao')){
        ui.decrease(+e.target.getAttribute('index'));

    }
})