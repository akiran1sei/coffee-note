import React from "react";
import { ScrollView, View, Text, StyleSheet, Linking } from "react-native";

const PrivacyPolicyJP = () => {
  const handleEmailPress = () => {
    Linking.openURL("mailto:nakamori.work@gmail.com");
  };

  return (
    <ScrollView style={styles.privacyPolicyContainer}>
      <View style={styles.privacyPolicyContent}>
        <Text style={styles.privacyPolicyTitle}>プライバシーポリシー</Text>
        <Text style={styles.privacyPolicyLastUpdated}>
          最終更新日: 2025年6月24日
        </Text>

        <Text style={styles.privacyPolicyParagraph}>
          このプライバシーポリシーは、お客様がサービスを利用する際の情報の収集、使用、開示に関する当社のポリシーと手順について説明し、お客様のプライバシーの権利と法律がお客様をどのように保護するかを説明します。
        </Text>

        <Text style={styles.privacyPolicyParagraph}>
          当社は、サービスの提供と改善のためにお客様の個人データを使用します。サービスを利用することにより、お客様はこのプライバシーポリシーに従った情報の収集と使用に同意するものとします。
        </Text>

        <Text style={styles.privacyPolicySectionTitle}>解釈と定義</Text>

        <Text style={styles.privacyPolicySubTitle}>解釈</Text>
        <Text style={styles.privacyPolicyParagraph}>
          冒頭の文字が大文字である単語は、以下の条件で定義された意味を持ちます。以下の定義は、単数形または複数形に関係なく、同じ意味を持つものとします。
        </Text>

        <Text style={styles.privacyPolicySubTitle}>定義</Text>
        <Text style={styles.privacyPolicyParagraph}>
          このプライバシーポリシーの目的のために：
        </Text>

        <View style={styles.privacyPolicyDefinitionsList}>
          <View style={styles.privacyPolicyDefinitionItem}>
            <Text style={styles.privacyPolicyDefinitionTerm}>アカウント</Text>
            <Text style={styles.privacyPolicyDefinitionText}>
              お客様が当社のサービスまたはサービスの一部にアクセスするために作成された一意のアカウントを意味します。
            </Text>
          </View>

          <View style={styles.privacyPolicyDefinitionItem}>
            <Text style={styles.privacyPolicyDefinitionTerm}>関連会社</Text>
            <Text style={styles.privacyPolicyDefinitionText}>
              当事者を管理し、当事者によって管理され、または当事者と共通の管理下にあるエンティティを意味します。「管理」とは、取締役または他の管理機関の選任のための投票権を有する株式、持分、またはその他の証券の50%以上の所有権を意味します。
            </Text>
          </View>

          <View style={styles.privacyPolicyDefinitionItem}>
            <Text style={styles.privacyPolicyDefinitionTerm}>
              アプリケーション
            </Text>
            <Text style={styles.privacyPolicyDefinitionText}>
              当社が提供するソフトウェアプログラムであるCoffee Noteを指します。
            </Text>
          </View>

          <View style={styles.privacyPolicyDefinitionItem}>
            <Text style={styles.privacyPolicyDefinitionTerm}>会社</Text>
            <Text style={styles.privacyPolicyDefinitionText}>
              (本契約では「当社」、「私たち」、「私たちの」と総称されます):
              Coffee Noteを指します。
            </Text>
          </View>

          <View style={styles.privacyPolicyDefinitionItem}>
            <Text style={styles.privacyPolicyDefinitionTerm}>国</Text>
            <Text style={styles.privacyPolicyDefinitionText}>
              日本を指します。
            </Text>
          </View>

          <View style={styles.privacyPolicyDefinitionItem}>
            <Text style={styles.privacyPolicyDefinitionTerm}>デバイス</Text>
            <Text style={styles.privacyPolicyDefinitionText}>
              コンピュータ、携帯電話、デジタルタブレットなど、サービスにアクセスできるすべてのデバイスを意味します。
            </Text>
          </View>

          <View style={styles.privacyPolicyDefinitionItem}>
            <Text style={styles.privacyPolicyDefinitionTerm}>個人データ</Text>
            <Text style={styles.privacyPolicyDefinitionText}>
              識別された、または識別可能な個人に関するあらゆる情報を指します。
            </Text>
          </View>

          <View style={styles.privacyPolicyDefinitionItem}>
            <Text style={styles.privacyPolicyDefinitionTerm}>サービス</Text>
            <Text style={styles.privacyPolicyDefinitionText}>
              アプリケーションを指します。
            </Text>
          </View>

          <View style={styles.privacyPolicyDefinitionItem}>
            <Text style={styles.privacyPolicyDefinitionTerm}>
              サービスプロバイダー
            </Text>
            <Text style={styles.privacyPolicyDefinitionText}>
              会社に代わってデータを処理する自然人または法人を意味します。これは、サービスの促進、会社に代わってサービスを提供するため、サービスに関連するサービスを実行するため、またはサービスがどのように使用されているかを会社が分析するのを支援するために会社によって雇用された第三者企業または個人を指します。
            </Text>
          </View>

          <View style={styles.privacyPolicyDefinitionItem}>
            <Text style={styles.privacyPolicyDefinitionTerm}>
              第三者ソーシャルメディアサービス
            </Text>
            <Text style={styles.privacyPolicyDefinitionText}>
              ユーザーがサービスを使用するためにログインまたはアカウントを作成できるウェブサイトまたはソーシャルネットワークウェブサイトを指します。
            </Text>
          </View>

          <View style={styles.privacyPolicyDefinitionItem}>
            <Text style={styles.privacyPolicyDefinitionTerm}>
              利用状況データ
            </Text>
            <Text style={styles.privacyPolicyDefinitionText}>
              サービスの使用によって、またはサービスインフラストラクチャ自体から自動的に収集されるデータを指します（例：ページの訪問期間）。
            </Text>
          </View>

          <View style={styles.privacyPolicyDefinitionItem}>
            <Text style={styles.privacyPolicyDefinitionTerm}>お客様</Text>
            <Text style={styles.privacyPolicyDefinitionText}>
              サービスにアクセスまたは使用する個人、または、該当する場合、当該個人がサービスにアクセスまたは使用する企業、またはその他の法人を意味します。
            </Text>
          </View>
        </View>

        <Text style={styles.privacyPolicySectionTitle}>
          お客様の個人データの収集と使用
        </Text>

        <Text style={styles.privacyPolicySubTitle}>収集されるデータの種類</Text>

        <Text style={styles.privacyPolicySubSubTitle}>個人データ</Text>
        <Text style={styles.privacyPolicyParagraph}>
          当社のサービスを使用中に、当社はお客様に連絡または識別するために使用できる特定の個人識別情報を提供するようお願いする場合があります。個人識別情報には以下が含まれますが、これらに限定されません。
        </Text>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>メールアドレス</Text>
        </View>
        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>氏名</Text>
        </View>
        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>利用状況データ</Text>
        </View>

        <Text style={styles.privacyPolicySubSubTitle}>利用状況データ</Text>
        <Text style={styles.privacyPolicyParagraph}>
          利用状況データは、サービスの使用中に自動的に収集されます。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          利用状況データには、お客様のデバイスのインターネットプロトコルアドレス（例：IPアドレス）、ブラウザの種類、ブラウザのバージョン、お客様が訪問する当社のサービスのページ、訪問の日時、それらのページでの滞在時間、一意のデバイス識別子、その他の診断データなどの情報が含まれる場合があります。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          お客様がモバイルデバイスによって、またはモバイルデバイスを通じてサービスにアクセスする場合、当社は自動的に特定の情報を収集することがあります。これには、お客様が使用するモバイルデバイスの種類、お客様のモバイルデバイスの一意のID、お客様のモバイルデバイスのIPアドレス、お客様のモバイルオペレーティングシステム、お客様が使用するモバイルインターネットブラウザの種類、一意のデバイス識別子、その他の診断データが含まれますが、これらに限定されません。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          当社はまた、お客様が当社のサービスを訪問するたびに、またはモバイルデバイスによって、またはモバイルデバイスを通じてサービスにアクセスするたびに、お客様のブラウザが送信する情報を収集することがあります。
        </Text>

        <Text style={styles.privacyPolicySubSubTitle}>
          第三者ソーシャルメディアサービスからの情報
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          会社は、以下の第三者ソーシャルメディアサービスを通じて、お客様がサービスを使用するためにアカウントを作成し、ログインすることを許可しています。
        </Text>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>Google</Text>
        </View>
        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>Facebook</Text>
        </View>
        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>Instagram</Text>
        </View>
        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>Twitter</Text>
        </View>
        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>LinkedIn</Text>
        </View>

        <Text style={styles.privacyPolicyParagraph}>
          お客様が第三者ソーシャルメディアサービスを通じて登録するか、またはその他の方法でアクセスを許可する場合、当社は、お客様の第三者ソーシャルメディアサービスのアカウントにすでに関連付けられている個人データ（氏名、メールアドレス、活動、そのアカウントに関連付けられている連絡先リストなど）を収集する場合があります。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          お客様はまた、第三者ソーシャルメディアサービスのアカウントを通じて当社に追加情報を共有するオプションを持つ場合があります。登録時またはその他の方法でそのような情報と個人データを提供することを選択した場合、お客様は当社がこのプライバシーポリシーに従ってそれを使用、共有、および保存することを許可するものとします。
        </Text>

        <Text style={styles.privacyPolicySubSubTitle}>
          アプリケーション使用中に収集される情報
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          当社のアプリケーションを使用中に、当社のアプリケーションの機能を提供するために、お客様の事前の許可を得て、以下を収集する場合があります。
        </Text>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>お客様の位置情報</Text>
        </View>
        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            お客様のデバイスのカメラおよびフォトライブラリからの写真およびその他の情報
          </Text>
        </View>

        <Text style={styles.privacyPolicyParagraph}>
          当社は、この情報を当社のサービスの機能を提供し、当社のサービスを改善およびカスタマイズするために使用します。この情報は、会社のサーバーおよび/またはサービスプロバイダーのサーバーにアップロードされるか、または単にお客様のデバイスに保存される場合があります。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          お客様は、デバイスの設定を通じて、いつでもこの情報へのアクセスを有効または無効にすることができます。
        </Text>

        <Text style={styles.privacyPolicySubTitle}>
          お客様の個人データの使用
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          会社は、以下の目的でお客様の個人データを使用することがあります。
        </Text>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>
              当社のサービスの提供と維持のため
            </Text>
            、これには当社のサービスの利用状況の監視が含まれます。
          </Text>
        </View>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>
              お客様のアカウントを管理するため:
            </Text>
            サービスユーザーとしてのお客様の登録を管理するためです。お客様が提供する個人データにより、登録ユーザーとして利用できるサービスのさまざまな機能にアクセスできます。
          </Text>
        </View>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>契約の履行のため:</Text>
            お客様が購入した製品、品目、またはサービスの購入契約、またはサービスを通じて当社とのその他の契約の開発、遵守、および履行のためです。
          </Text>
        </View>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>お客様に連絡するため:</Text>
            電子メール、電話、SMS、またはその他の同等の形式の電子通信（モバイルアプリケーションのプッシュ通知など）により、機能、製品、または契約サービスの更新または情報提供に関する通信（必要な場合または妥当な場合にセキュリティ更新を含む）を行うためです。
          </Text>
        </View>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            お客様がそのような情報の受信をオプトアウトしていない限り、お客様がすでに購入または問い合わせた製品、サービス、およびイベントに類似するその他の商品、サービス、およびイベントに関するニュース、特別オファー、および一般情報をお客様に提供するため。
          </Text>
        </View>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>
              お客様からのリクエストを管理するため:
            </Text>
            お客様からの当社へのリクエストに対応し、管理するためです。
          </Text>
        </View>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>事業譲渡のため:</Text>
            当社は、当社の資産の一部または全部の合併、分割、再編、再編成、解散、またはその他の売却または譲渡を評価または実施するために、お客様の情報を使用することがあります。これは、継続企業として、または破産、清算、または類似の手続きの一部として行われる場合があり、その場合、当社のサービスユーザーに関する個人データも譲渡される資産に含まれます。
          </Text>
        </View>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>その他の目的のため</Text>:
            当社は、データ分析、利用状況の傾向の特定、プロモーションキャンペーンの効果の判断、および当社のサービス、製品、サービス、マーケティング、およびお客様の体験の評価と改善など、その他の目的でお客様の情報を使用することがあります。
          </Text>
        </View>

        <Text style={styles.privacyPolicyParagraph}>
          当社は、以下の状況でお客様の個人情報を共有することがあります。
        </Text>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>
              サービスプロバイダーと共有する場合:
            </Text>
            当社は、当社のサービスの利用状況を監視し、お客様に連絡するために、お客様の個人情報をサービスプロバイダーと共有することがあります。
          </Text>
        </View>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>事業譲渡の場合:</Text>
            当社は、当社の事業の全部または一部の合併、会社の資産の売却、資金調達、または買収に関連して、または交渉中に、お客様の個人情報を共有または移転することがあります。
          </Text>
        </View>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>
              関連会社と共有する場合:
            </Text>
            当社は、お客様の情報を当社の関連会社と共有することがあります。その場合、当社はこれらの関連会社にこのプライバシーポリシーを尊重するよう求めます。関連会社には、当社の親会社、および当社が管理する、または当社と共通の管理下にあるその他の子会社、ジョイントベンチャーパートナー、またはその他の会社が含まれます。
          </Text>
        </View>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>
              ビジネスパートナーと共有する場合:
            </Text>
            当社は、特定の製品、サービス、またはプロモーションをお客様に提供するために、お客様の情報を当社のビジネスパートナーと共有することがあります。
          </Text>
        </View>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>
              他のユーザーと共有する場合:
            </Text>
            お客様が公開エリアで他のユーザーと個人情報を共有したり、その他の方法で交流したりすると、そのような情報はすべてのユーザーに表示され、公開される可能性があります。お客様が他のユーザーと交流したり、第三者ソーシャルメディアサービスを通じて登録したりする場合、第三者ソーシャルメディアサービスの連絡先には、お客様の氏名、プロフィール、写真、および活動の説明が表示されることがあります。同様に、他のユーザーは、お客様の活動の説明を表示したり、お客様と通信したり、お客様のプロフィールを表示したりできます。
          </Text>
        </View>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            <Text style={styles.privacyPolicyBold}>
              お客様の同意を得て共有する場合:
            </Text>
            当社は、お客様の同意を得て、その他の目的でお客様の個人情報を開示することがあります。
          </Text>
        </View>

        <Text style={styles.privacyPolicySubTitle}>
          お客様の個人データの保持
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          会社は、このプライバシーポリシーに定められた目的のために必要な限りにおいてのみ、お客様の個人データを保持します。当社は、当社の法的義務を遵守するために（例えば、適用される法律を遵守するためにデータを保持する必要がある場合）、紛争を解決し、当社の法的合意およびポリシーを施行するために必要な範囲で、お客様の個人データを保持し、使用します。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          会社はまた、社内分析の目的で利用状況データを保持します。利用状況データは通常、セキュリティを強化するため、または当社のサービスの機能を改善するために使用される場合、または当社がこのデータをより長期間保持することが法的に義務付けられている場合を除き、より短い期間保持されます。
        </Text>

        <Text style={styles.privacyPolicySubTitle}>
          お客様の個人データの転送
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          個人データを含むお客様の情報は、会社の営業所および処理に関与する当事者が所在するその他の場所で処理されます。これは、この情報が、データ保護法がお客様の管轄区域と異なる可能性のあるお客様の州、県、国、またはその他の政府の管轄区域外のコンピューターに転送され、そこに維持される可能性があることを意味します。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          このプライバシーポリシーへのお客様の同意、およびその後の情報の提出は、その転送へのお客様の同意を意味します。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          会社は、お客様のデータが安全に、このプライバシーポリシーに従って処理されることを保証するために、合理的に必要なすべての措置を講じます。お客様のデータおよびその他の個人情報のセキュリティを含む適切な管理が整っていない限り、お客様の個人データが組織または国に転送されることはありません。
        </Text>

        <Text style={styles.privacyPolicySubTitle}>
          お客様の個人データの削除
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          お客様には、当社が収集したお客様の個人データを削除する、または削除を支援するよう要求する権利があります。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          当社のサービスでは、サービス内からお客様に関する特定の情報を削除する機能が提供される場合があります。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          お客様は、アカウントをお持ちの場合、いつでもアカウントにサインインし、個人情報を管理できるアカウント設定セクションにアクセスすることで、お客様の情報を更新、修正、または削除できます。また、当社に提供した個人データへのアクセス、修正、または削除を要求するためにお問い合わせいただくこともできます。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          ただし、当社が法的義務または正当な根拠がある場合、特定の情報を保持する必要があることにご注意ください。
        </Text>

        <Text style={styles.privacyPolicySubTitle}>
          お客様の個人データの開示
        </Text>

        <Text style={styles.privacyPolicySubSubTitle}>事業取引</Text>
        <Text style={styles.privacyPolicyParagraph}>
          会社が合併、買収、または資産売却に関与する場合、お客様の個人データが転送されることがあります。お客様の個人データが転送され、異なるプライバシーポリシーの対象となる前に通知します。
        </Text>

        <Text style={styles.privacyPolicySubSubTitle}>法執行機関</Text>
        <Text style={styles.privacyPolicyParagraph}>
          特定の状況下では、会社は、法律で義務付けられている場合、または公的機関（例：裁判所または政府機関）からの有効な要求に応じて、お客様の個人データを開示する必要がある場合があります。
        </Text>

        <Text style={styles.privacyPolicySubSubTitle}>その他の法的要件</Text>
        <Text style={styles.privacyPolicyParagraph}>
          会社は、そのような措置が以下の目的で必要であると誠実に判断した場合、お客様の個人データを開示することがあります。
        </Text>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            法的義務を遵守するため
          </Text>
        </View>
        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            会社の権利または財産を保護および防御するため
          </Text>
        </View>
        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            サービスに関連する可能性のある不正行為を防止または調査するため
          </Text>
        </View>
        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            サービスユーザーまたは公衆の個人の安全を保護するため
          </Text>
        </View>
        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            法的責任から保護するため
          </Text>
        </View>

        <Text style={styles.privacyPolicySubTitle}>
          お客様の個人データのセキュリティ
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          お客様の個人データのセキュリティは当社にとって重要ですが、インターネット経由の送信方法、または電子ストレージ方法のいずれも100%安全ではないことを覚えておいてください。当社は、お客様の個人データを保護するために商業的に許容される手段を使用するよう努めますが、その絶対的なセキュリティを保証することはできません。
        </Text>

        <Text style={styles.privacyPolicySectionTitle}>子供のプライバシー</Text>
        <Text style={styles.privacyPolicyParagraph}>
          当社のサービスは13歳未満の者を対象としていません。当社は、13歳未満の者から個人を特定できる情報を意図的に収集することはありません。お客様が親または保護者であり、お子様が当社に個人データを提供したことを認識している場合は、当社にご連絡ください。保護者の同意の確認なしに13歳未満の者から個人データを収集したことを認識した場合、当社はその情報を当社のサーバーから削除するための措置を講じます。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          当社がお客様の情報を処理するための法的根拠として同意に依拠する必要があり、お客様の国が親からの同意を要求する場合、当社はその情報を収集して使用する前にお客様の親の同意を要求する場合があります。
        </Text>

        <Text style={styles.privacyPolicySectionTitle}>
          他のウェブサイトへのリンク
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          当社のサービスには、当社が運営していない他のウェブサイトへのリンクが含まれている場合があります。第三者のリンクをクリックすると、その第三者のサイトに移動します。訪問するすべてのサイトのプライバシーポリシーを確認することを強くお勧めします。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          当社は、第三者のサイトまたはサービスのコンテンツ、プライバシーポリシー、または慣行について管理権限を持たず、いかなる責任も負いません。
        </Text>

        <Text style={styles.privacyPolicySectionTitle}>
          このプライバシーポリシーへの変更
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          当社は、このプライバシーポリシーを随時更新することがあります。変更があった場合は、このページに新しいプライバシーポリシーを掲載して通知します。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          変更が有効になる前に、電子メールおよび/または当社のサービス上の目立つ通知を通じてお客様に通知し、このプライバシーポリシーの冒頭の「最終更新日」を更新します。
        </Text>
        <Text style={styles.privacyPolicyParagraph}>
          このプライバシーポリシーに変更がないか定期的に確認することをお勧めします。このプライバシーポリシーへの変更は、このページに掲載された時点で有効になります。
        </Text>

        <Text style={styles.privacyPolicySectionTitle}>お問い合わせ</Text>
        <Text style={styles.privacyPolicyParagraph}>
          このプライバシーポリシーに関してご質問がある場合は、以下までお問い合わせください。
        </Text>

        <View style={styles.privacyPolicyListItem}>
          <Text style={styles.privacyPolicyListText}>
            電子メール:
            <Text style={styles.privacyPolicyLink} onPress={handleEmailPress}>
              nakamori.work@gmail.com
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  privacyPolicyContainer: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  privacyPolicyContent: {
    maxWidth: 800,
    margin: 20,
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 8,
    shadowColor: "#333",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  privacyPolicyTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0056b3",
    borderBottomWidth: 2,
    borderBottomColor: "#0056b3",
    paddingBottom: 10,
    marginBottom: 20,
  },
  privacyPolicyLastUpdated: {
    fontSize: 14,
    color: "#333",
    marginBottom: 15,
  },
  privacyPolicyParagraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 10,
  },
  privacyPolicySectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0056b3",
    marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
    marginBottom: 15,
  },
  privacyPolicySubTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0056b3",
    marginTop: 20,
    marginBottom: 10,
  },
  privacyPolicySubSubTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0056b3",
    marginTop: 15,
    marginBottom: 8,
  },
  privacyPolicyDefinitionsList: {
    marginLeft: 20,
    marginTop: 10,
  },
  privacyPolicyDefinitionItem: {
    marginBottom: 15,
  },
  privacyPolicyDefinitionTerm: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  privacyPolicyDefinitionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  privacyPolicyLink: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
  privacyPolicyListItem: {
    marginBottom: 5,
    marginLeft: 10,
  },
  privacyPolicyListText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  privacyPolicyBold: {
    fontWeight: "bold",
  },
});

export default PrivacyPolicyJP; // エクスポートはPrivacyPolicyENのままにしておきます。必要に応じて調整してください。
