<component is="style">
    @keyframes progressbar {
        from {
            width: 0%;
        }
        to {
            width: 100%;
        }
    }
    @keyframes changeColor{
        0% {
            color: #000000;
        }
        20% {
            color: #FF0000;
        }
        80%{
            color: #00FF00;
        }
        100%{
            color: #000000;
        }
    }
    #progress.parallax {
        position: fixed;
        top: 0;
        left: 0;
        width: 50%;
        height: 10px;
        background-color: #6664CF;
        animation: progressbar linear both;
        animation-timeline: scroll();
    }
    .change-color{
        animation: changeColor linear both;
        animation-timeline: view(block 20% 20%);
    }
</component>
<div>
    <div class="parallax" id="progress"></div>
    <p>Aliqua excepteur dolor ipsum in eiusmod elit irure fugiat nulla non culpa Lorem pariatur Lorem anim. Dolore non quis pariatur cillum officia. Labore in qui ullamco officia laborum quis et. Irure reprehenderit dolor proident veniam excepteur amet est tempor exercitation. Exercitation duis sit ut exercitation adipisicing elit quis.</p>
    <p>Pariatur cillum cillum nisi occaecat culpa reprehenderit exercitation commodo tempor. Aliqua do mollit deserunt ullamco officia aliqua cillum esse sunt adipisicing ad in et non consectetur. Mollit magna aliqua pariatur voluptate aute duis culpa consequat sunt consequat fugiat culpa voluptate ullamco. Excepteur magna magna amet. Minim cillum sunt nulla minim nulla voluptate. Cillum eiusmod mollit in nostrud aliqua ex aliqua sint elit deserunt. Nulla est reprehenderit amet amet cillum amet fugiat officia qui minim exercitation sunt esse. Occaecat magna enim irure mollit sunt officia Lorem ex excepteur consequat consectetur.</p>
    <p>Consequat magna sint irure ex enim est aute irure eiusmod nostrud laborum cupidatat voluptate aliquip. Labore adipisicing velit aliquip in fugiat sint magna ex. Ipsum nulla qui commodo veniam commodo ex veniam eu dolore consectetur proident sint duis ex veniam. Culpa ipsum adipisicing et aute do sunt consequat est elit sit do. Occaecat eu pariatur officia commodo commodo et est qui qui.</p>
    <p class="change-color parallax">Reprehenderit sunt veniam aliquip commodo. Qui mollit excepteur reprehenderit. Cillum in exercitation commodo. Commodo consequat Lorem consequat ex sint culpa. Laboris velit adipisicing commodo laborum elit aute et Lorem tempor elit velit amet quis occaecat consectetur. Proident sit excepteur consequat consectetur excepteur esse cupidatat ad duis cillum. Consequat laborum ut occaecat irure nostrud.</p>
    <p>Exercitation dolore minim tempor quis mollit ipsum nulla eu anim officia ipsum excepteur dolor veniam laborum. Ex voluptate tempor adipisicing proident est irure aute id enim laboris aliquip aliquip duis anim excepteur. Cillum non cillum commodo in in eu. Voluptate Lorem sint est dolore laborum. Tempor aute enim eiusmod sit anim ea velit dolore aute dolore veniam deserunt enim culpa. Elit aliqua anim commodo. Veniam consequat aliqua irure tempor labore ipsum. Veniam exercitation sunt ipsum reprehenderit ea irure duis.</p>
    <p>Laboris quis ut aliquip nulla fugiat ut anim qui. Lorem occaecat non commodo incididunt amet exercitation laborum et qui irure ad. Ea pariatur laboris tempor in labore deserunt voluptate Lorem aute aliqua ad. Fugiat elit in culpa. Eu incididunt duis elit dolore Lorem nulla tempor quis ipsum laboris nisi incididunt non exercitation nostrud. Labore ipsum occaecat elit ad ad dolore culpa.</p>
</div>
