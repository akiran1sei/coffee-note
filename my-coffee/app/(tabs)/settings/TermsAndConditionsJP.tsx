import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
  TouchableOpacity,
} from "react-native";

const TermsAndConditionsJP = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>利用規約</Text>
      <Text style={styles.p}>最終更新日: 2025年6月26日</Text>
      <Text style={styles.p}>
        当サービスをご利用になる前に、この利用規約を注意深くお読みください。
      </Text>

      <Text style={styles.h2}>解釈と定義</Text>
      <Text style={styles.h3}>解釈</Text>
      <Text style={styles.p}>
        頭文字が大文字で記載されている用語は、以下の条件に基づいて定義された意味を持ちます。以下の定義は、単数形か複数形かに関わらず、同じ意味を持つものとします。
      </Text>

      <Text style={styles.h3}>定義</Text>
      <Text style={styles.p}>この利用規約において：</Text>
      <View style={styles.ul}>
        <View style={styles.li}>
          <Text style={styles.liBullet}>• </Text>
          <Text style={styles.liText}>
            <Text style={styles.strong}>アプリケーション</Text>とは、Coffee
            Noteという名称で、お客様が電子機器にダウンロードした、当社が提供するソフトウェアプログラムを意味します。
          </Text>
        </View>
        <View style={styles.li}>
          <Text style={styles.liBullet}>• </Text>
          <Text style={styles.liText}>
            <Text style={styles.strong}>アプリケーションストア</Text>とは、Apple
            Inc.（Apple App Store）またはGoogle Inc.（Google Play
            Store）が運営・開発するデジタル配信サービスで、アプリケーションがダウンロードされた場所を意味します。
          </Text>
        </View>
        <View style={styles.li}>
          <Text style={styles.liBullet}>• </Text>
          <Text style={styles.liText}>
            <Text style={styles.strong}>関連会社</Text>
            とは、当事者を支配し、当事者に支配され、または当事者と共通の支配下にある事業体を意味し、「支配」とは、取締役またはその他の管理権限の選出に対する議決権を有する株式、持分または証券の50%以上の所有権を意味します。
          </Text>
        </View>
        <View style={styles.li}>
          <Text style={styles.liBullet}>• </Text>
          <Text style={styles.liText}>
            <Text style={styles.strong}>国</Text>とは：日本を指します。
          </Text>
        </View>
        <View style={styles.li}>
          <Text style={styles.liBullet}>• </Text>
          <Text style={styles.liText}>
            <Text style={styles.strong}>会社</Text>
            （本契約において「会社」、「当社」、「私たち」、「我々」と呼ばれる）とは、Coffee
            Noteを指します。
          </Text>
        </View>
        <View style={styles.li}>
          <Text style={styles.liBullet}>• </Text>
          <Text style={styles.liText}>
            <Text style={styles.strong}>デバイス</Text>
            とは、コンピューター、携帯電話、またはデジタルタブレットなど、サービスにアクセスできる任意の機器を意味します。
          </Text>
        </View>
        <View style={styles.li}>
          <Text style={styles.liBullet}>• </Text>
          <Text style={styles.liText}>
            <Text style={styles.strong}>サービス</Text>
            とは、アプリケーションを指します。
          </Text>
        </View>
        <View style={styles.li}>
          <Text style={styles.liBullet}>• </Text>
          <Text style={styles.liText}>
            <Text style={styles.strong}>利用規約</Text>
            （「規約」とも呼ばれる）とは、サービスの使用に関してお客様と会社の間の完全な合意を形成するこれらの利用規約を意味します。この利用規約は、
            <Text
              style={styles.link}
              onPress={() =>
                Linking.openURL(
                  "https://www.termsfeed.com/terms-conditions-generator/"
                )
              }
            >
              利用規約ジェネレーター
            </Text>
            の支援を受けて作成されました。
          </Text>
        </View>
        <View style={styles.li}>
          <Text style={styles.liBullet}>• </Text>
          <Text style={styles.liText}>
            <Text style={styles.strong}>第三者ソーシャルメディアサービス</Text>
            とは、サービスによって表示、含有、または利用可能にされる可能性のある第三者が提供するサービスまたはコンテンツ（データ、情報、製品またはサービスを含む）を意味します。
          </Text>
        </View>
        <View style={styles.li}>
          <Text style={styles.liBullet}>• </Text>
          <Text style={styles.liText}>
            <Text style={styles.strong}>お客様</Text>
            とは、サービスにアクセスまたは使用する個人、または該当する場合は、そのような個人が代理してサービスにアクセスまたは使用する会社、その他の法人を意味します。
          </Text>
        </View>
      </View>

      <Text style={styles.h2}>承認</Text>
      <Text style={styles.p}>
        これらは本サービスの使用を規定する利用規約であり、お客様と会社の間で運用される契約です。これらの利用規約は、サービスの使用に関するすべてのユーザーの権利と義務を定めています。
      </Text>
      <Text style={styles.p}>
        お客様のサービスへのアクセスと使用は、これらの利用規約の受諾と遵守を条件とします。これらの利用規約は、サービスにアクセスまたは使用するすべての訪問者、ユーザー、その他の者に適用されます。
      </Text>
      <Text style={styles.p}>
        サービスにアクセスまたは使用することにより、お客様はこれらの利用規約に拘束されることに同意します。これらの利用規約のいずれかの部分に同意しない場合は、サービスにアクセスすることはできません。
      </Text>
      <Text style={styles.p}>
        お客様は18歳以上であることを表明します。会社は18歳未満の方によるサービスの使用を許可していません。
      </Text>
      <Text style={styles.p}>
        お客様のサービスへのアクセスと使用は、会社のプライバシーポリシーの受諾と遵守も条件とします。当社のプライバシーポリシーは、お客様がアプリケーションまたはウェブサイトを使用する際の個人情報の収集、使用、開示に関する当社の方針と手順を説明し、お客様のプライバシー権と法律がお客様をどのように保護するかについて説明しています。当サービスを使用する前に、当社のプライバシーポリシーを注意深くお読みください。
      </Text>

      <Text style={styles.h2}>他のウェブサイトへのリンク</Text>
      <Text style={styles.p}>
        当サービスには、会社が所有または管理していない第三者のウェブサイトまたはサービスへのリンクが含まれる場合があります。
      </Text>
      <Text style={styles.p}>
        会社は、第三者のウェブサイトまたはサービスのコンテンツ、プライバシーポリシー、または慣行について、管理権を持たず、責任を負いません。お客様は、会社が、そのようなウェブサイトまたはサービスを通じて利用可能なコンテンツ、商品またはサービスの使用または依存に関連して、直接的または間接的に生じるいかなる損害または損失についても、責任を負わないことを理解し、同意します。
      </Text>
      <Text style={styles.p}>
        お客様が訪問する第三者のウェブサイトまたはサービスの利用規約およびプライバシーポリシーを読むことを強くお勧めします。
      </Text>

      <Text style={styles.h2}>終了</Text>
      <Text style={styles.p}>
        お客様がこれらの利用規約に違反した場合を含め、いかなる理由であっても、事前の通知や責任なしに、当社はお客様のアクセスを直ちに終了または停止する場合があります。
      </Text>
      <Text style={styles.p}>
        終了時には、お客様のサービス使用権は直ちに停止します。
      </Text>

      <Text style={styles.h2}>責任の制限</Text>
      <Text style={styles.p}>
        お客様が被る可能性のある損害にかかわらず、本規約のいかなる条項の下での会社およびそのサプライヤーの全責任、およびそれらすべてに対するお客様の排他的救済は、お客様がサービスを通じて実際に支払った金額、またはサービスを通じて何も購入していない場合は100米ドルに制限されます。
      </Text>
      <Text style={styles.p}>
        適用法によって許可される最大限の範囲において、会社またはそのサプライヤーは、サービスの使用または使用不能、サービスで使用される第三者ソフトウェアおよび/または第三者ハードウェア、または本規約のいかなる条項に関連して生じる、特別、偶発的、間接的、または結果的損害（利益の損失、データまたはその他の情報の損失、事業中断、人身傷害、プライバシーの侵害による損害を含むがこれらに限定されない）については、たとえ会社またはサプライヤーがそのような損害の可能性について助言されていた場合でも、また救済がその本質的目的を果たさない場合でも、いかなる場合も責任を負いません。
      </Text>
      <Text style={styles.p}>
        一部の州では、黙示の保証の除外または偶発的または結果的損害の責任制限を認めていません。これは、上記の制限の一部がお客様に適用されない可能性があることを意味します。これらの州では、各当事者の責任は法律によって許可される最大限の範囲に制限されます。
      </Text>

      <Text style={styles.h2}>
        「現状有姿」および「利用可能な状態」での免責
      </Text>
      <Text style={styles.p}>
        サービスは「現状有姿」および「利用可能な状態」で、すべての欠陥および不具合と共に、いかなる種類の保証もなしに提供されます。適用法の下で許可される最大限の範囲において、会社は、自らの名において、およびその関連会社、ならびにそれぞれのライセンサーおよびサービスプロバイダーの名において、サービスに関して、商品性、特定目的への適合性、権原および非侵害の黙示保証、ならびに取引過程、履行過程、使用または商慣行から生じる可能性のある保証を含む、明示的、黙示的、法定またはその他のすべての保証を明示的に否認します。前述を制限することなく、会社は、サービスがお客様の要件を満たす、意図された結果を達成する、他のソフトウェア、アプリケーション、システムまたはサービスと互換性があるまたは動作する、中断なく動作する、性能または信頼性の基準を満たす、エラーがない、またはエラーや欠陥が修正可能であるまたは修正されることについて、いかなる保証も約束も提供せず、いかなる種類の表明も行いません。
      </Text>
      <Text style={styles.p}>
        前述を制限することなく、会社も会社のプロバイダーも、以下について明示的または黙示的ないかなる種類の表明または保証も行いません：(i)
        サービスの動作または利用可能性、またはそこに含まれる情報、コンテンツ、材料または製品について；(ii)
        サービスが中断されない、またはエラーがないことについて；(iii)
        サービスを通じて提供される情報またはコンテンツの正確性、信頼性、または通貨性について；または
        (iv)
        サービス、そのサーバー、コンテンツ、または会社から送信される、または会社の代理で送信される電子メールがウイルス、スクリプト、トロイの木馬、ワーム、マルウェア、タイムボムまたはその他の有害なコンポーネントを含まないことについて。
      </Text>
      <Text style={styles.p}>
        一部の管轄区域では、特定の種類の保証の除外または消費者の適用される法定権利の制限を認めていないため、上記の除外および制限の一部またはすべてがお客様に適用されない場合があります。しかし、そのような場合、本条に定められた除外および制限は、適用法の下で強制可能な最大限の範囲で適用されます。
      </Text>

      <Text style={styles.h2}>準拠法</Text>
      <Text style={styles.p}>
        国の法律（抵触法規則を除く）が、本規約およびお客様のサービス使用を規律します。お客様のアプリケーションの使用は、他の地方、州、国内、または国際法の対象となる場合もあります。
      </Text>

      <Text style={styles.h2}>紛争解決</Text>
      <Text style={styles.p}>
        サービスについて懸念や紛争がある場合、お客様は最初に会社に連絡して非公式に紛争を解決しようとすることに同意します。
      </Text>

      <Text style={styles.h2}>欧州連合（EU）ユーザー向け</Text>
      <Text style={styles.p}>
        お客様が欧州連合の消費者である場合、お客様が居住する国の法律の強行規定の恩恵を受けます。
      </Text>

      <Text style={styles.h2}>米国法的遵守</Text>
      <Text style={styles.p}>
        お客様は、(i)
        米国政府の禁輸措置の対象となる国に所在していない、または米国政府によって「テロ支援」国として指定されていない、および
        (ii)
        米国政府の禁止または制限当事者リストに記載されていないことを表明し、保証します。
      </Text>

      <Text style={styles.h2}>分離可能性と権利放棄</Text>
      <Text style={styles.h3}>分離可能性</Text>
      <Text style={styles.p}>
        これらの規約のいずれかの条項が強制不能または無効であると判断された場合、そのような条項は適用法の下で可能な最大限の範囲でその条項の目的を達成するように変更され解釈され、残りの条項は完全に有効なままとします。
      </Text>
      <Text style={styles.h3}>権利放棄</Text>
      <Text style={styles.p}>
        本書に定められた場合を除き、これらの規約の下での権利の行使または義務の履行の要求の不履行は、その後いつでもそのような権利を行使し、またはそのような履行を要求する当事者の能力に影響せず、違反の放棄は、その後の違反の放棄を構成しません。
      </Text>

      <Text style={styles.h2}>翻訳の解釈</Text>
      <Text style={styles.p}>
        これらの利用規約は、当社がサービス上でお客様に提供した場合、翻訳されている可能性があります。お客様は、紛争の場合には元の英語のテキストが優先されることに同意します。
      </Text>

      <Text style={styles.h2}>これらの利用規約の変更</Text>
      <Text style={styles.p}>
        当社は、当社の単独の裁量により、いつでもこれらの規約を修正または置き換える権利を留保します。改訂が重要である場合、当社は新しい規約が発効する前に少なくとも30日前の通知を提供するよう合理的な努力をします。重要な変更を構成するものは、当社の単独の裁量により決定されます。
      </Text>
      <Text style={styles.p}>
        これらの改訂が発効した後も当サービスへのアクセスまたは使用を継続することにより、お客様は改訂された規約に拘束されることに同意します。新しい規約に全部または一部同意しない場合は、ウェブサイトとサービスの使用を停止してください。
      </Text>

      <Text style={styles.h2}>お問い合わせ</Text>
      <Text style={styles.p}>
        これらの利用規約についてご質問がございましたら、以下の方法でお問い合わせください：
      </Text>
      <View style={styles.ul}>
        <View style={styles.li}>
          <Text style={styles.liBullet}>• </Text>
          <Text style={styles.liText}>
            メール：
            <Text
              style={styles.link}
              onPress={() => Linking.openURL("mailto:nakamori.work@gmail.com")}
            >
              nakamori.work@gmail.com
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff", // 背景色を白に設定
  },
  h1: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  h2: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  h3: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
    color: "#333",
  },
  p: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    color: "#555",
  },
  ul: {
    marginBottom: 10,
    paddingLeft: 20, // リストのインデント
  },
  li: {
    flexDirection: "row",
    marginBottom: 5,
  },
  liBullet: {
    fontSize: 16,
    lineHeight: 24,
    marginRight: 5,
    color: "#555",
  },
  liText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
  strong: {
    fontWeight: "bold",
  },
  link: {
    color: "#007AFF", // iOSの標準リンクカラーに合わせた例
    textDecorationLine: "underline",
  },
});

export default TermsAndConditionsJP;
