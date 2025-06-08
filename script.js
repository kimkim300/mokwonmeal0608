// 날짜 형식을 YYYYMMDD로 변환하는 함수
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// 날짜를 YYYY년 MM월 DD일 형식으로 변환하는 함수
function formatDisplayDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
}

// 로딩 표시 함수
function showLoading() {
    Swal.fire({
        title: '급식 정보를 불러오는 중...',
        text: '잠시만 기다려주세요! 🍱',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

// 급식 정보를 가져오는 함수
async function getMealInfo() {
    const dateInput = document.getElementById('mealDate');
    const selectedDate = new Date(dateInput.value);
    const formattedDate = formatDate(selectedDate);
    
    // 선택된 날짜 표시
    document.getElementById('dateText').textContent = formatDisplayDate(selectedDate);
    
    // 로딩 표시
    showLoading();
    
    // API URL 구성
    const apiUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=B10&SD_SCHUL_CODE=7081440&MLSV_YMD=${formattedDate}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.text();
        
        // XML 응답을 파싱
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        
        // 급식 정보 추출
        const mealInfo = xmlDoc.getElementsByTagName("DDISH_NM")[0];
        const mealContent = document.getElementById('mealContent');
        
        // SweetAlert 닫기
        Swal.close();
        
        if (mealInfo) {
            // 줄바꿈을 <br> 태그로 변환하여 표시
            const mealText = mealInfo.textContent.replace(/\n/g, '<br>');
            mealContent.innerHTML = `<div class="text-center">
                <span class="text-3xl">🍱</span><br>
                ${mealText}
            </div>`;
            
            // 성공 알림
            Swal.fire({
                icon: 'success',
                title: '급식 정보를 불러왔습니다! 🎉',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        } else {
            mealContent.innerHTML = `<p class="text-center text-gray-600">
                <span class="text-3xl">😢</span><br>
                해당 날짜의 급식 정보가 없습니다.
            </p>`;
            
            // 정보 없음 알림
            Swal.fire({
                icon: 'info',
                title: '급식 정보 없음',
                text: '선택하신 날짜의 급식 정보가 없습니다. 😢',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    } catch (error) {
        console.error('Error fetching meal information:', error);
        document.getElementById('mealContent').innerHTML = 
            `<p class="text-center text-red-600">
                <span class="text-3xl">❌</span><br>
                급식 정보를 불러오는 중 오류가 발생했습니다.
            </p>`;
        
        // 에러 알림
        Swal.fire({
            icon: 'error',
            title: '오류 발생',
            text: '급식 정보를 불러오는 중 문제가 발생했습니다. 😢',
            confirmButtonText: '다시 시도'
        });
    }
}

// 페이지 로드 시 오늘 날짜로 설정
window.onload = function() {
    const today = new Date();
    const dateInput = document.getElementById('mealDate');
    dateInput.valueAsDate = today;
    getMealInfo();
};
